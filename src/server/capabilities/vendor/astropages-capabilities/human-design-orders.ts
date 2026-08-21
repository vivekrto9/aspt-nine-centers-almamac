import { linkBusinessLead, markLeadConvertedBySourceReference, normalizeLeadEmail } from "../../../aggregator/lead-records.ts";
import { AP_TABLES } from "../../../aggregator/db/tables.ts";
import { createId, nowIso, safeString, type RuntimeEnv } from "../../../aggregator/runtime.ts";
import { readSenderSettings, sendSesTransactionalEmail } from "../../../aggregator/notifications/ses.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createHumanDesignOrder = async ({
  env,
  email,
  readingId,
  locale = "en",
}: {
  env: RuntimeEnv;
  email: unknown;
  readingId?: unknown;
  locale?: string;
}) => {
  if (!env.DB) throw new Error("Checkout storage is not available.");
  const normalizedEmail = normalizeLeadEmail(email);
  if (!emailPattern.test(normalizedEmail) || normalizedEmail.length > 254) throw new Error("Enter a valid email address.");
  const safeReadingId = safeString(readingId);
  if (safeReadingId && !/^hd_chart_[A-Za-z0-9]+$/.test(safeReadingId)) throw new Error("Chart reference is invalid.");
  const id = createId("hd_order");
  const orderNumber = `NC-${id.slice(-10).toUpperCase()}`;
  const timestamp = nowIso();
  await env.DB.prepare(`INSERT INTO ${AP_TABLES.humanDesignOrders} (
    id, order_number, reading_id, email, normalized_email, amount_minor, currency,
    business_status, payment_status, fulfillment_status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, 9900, 'USD', 'new', 'pending', 'pending', ?, ?)`)
    .bind(id, orderNumber, safeReadingId || null, normalizedEmail, normalizedEmail, timestamp, timestamp).run?.();
  await linkBusinessLead({
    env,
    submission: {
      kind: "report",
      source: "report_order",
      formKey: "full-human-design-reading-checkout",
      pagePath: "/#readings",
      locale,
      email: normalizedEmail,
      sourceReferenceType: "human_design_order",
      sourceReferenceId: id,
      details: {
        orderNumber,
        reportSlug: "full-reading",
        reportTitle: "The full reading",
        amountCents: 9900,
        currency: "USD",
      },
    },
  });
  return { id, orderNumber, email: normalizedEmail, readingId: safeReadingId };
};

export const attachStripeCheckoutSession = async ({ env, orderId, sessionId }: { env: RuntimeEnv; orderId: string; sessionId: string }) => {
  if (!env.DB) return;
  await env.DB.prepare(`UPDATE ${AP_TABLES.humanDesignOrders} SET stripe_checkout_session_id = ?, updated_at = ? WHERE id = ? AND payment_status = 'pending'`)
    .bind(sessionId, nowIso(), orderId).run?.();
};

export const getHumanDesignOrderByCheckoutSession = async ({ env, sessionId }: { env: RuntimeEnv; sessionId: string }) => {
  if (!env.DB || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  return await env.DB.prepare(`SELECT order_number, payment_status, fulfillment_status FROM ${AP_TABLES.humanDesignOrders} WHERE stripe_checkout_session_id = ? LIMIT 1`)
    .bind(sessionId).first?.() as { order_number: string; payment_status: string; fulfillment_status: string } | null | undefined;
};

export const getPaidHumanDesignReadingAccess = async ({ env, readingId }: { env: RuntimeEnv; readingId: string }) => {
  if (!env.DB || !/^hd_chart_[A-Za-z0-9]+$/.test(readingId)) return null;
  try {
    const row = await env.DB.prepare(`SELECT id, order_number FROM ${AP_TABLES.humanDesignOrders}
      WHERE reading_id = ? AND payment_status = 'paid' ORDER BY paid_at DESC LIMIT 1`)
      .bind(readingId).first?.() as { id?: string; order_number?: string } | null | undefined;
    if (!row?.id) return null;
    return { orderId: row.id, orderNumber: safeString(row.order_number) };
  } catch {
    return null;
  }
};

export const hasPaidHumanDesignReadingAccess = async ({ env, readingId }: { env: RuntimeEnv; readingId: string }) =>
  Boolean(await getPaidHumanDesignReadingAccess({ env, readingId }));

export const failHumanDesignOrder = async ({ env, orderId }: { env: RuntimeEnv; orderId: string }) => {
  if (!env.DB) return;
  await env.DB.prepare(`UPDATE ${AP_TABLES.humanDesignOrders} SET payment_status = 'failed', updated_at = ? WHERE id = ? AND payment_status = 'pending'`)
    .bind(nowIso(), orderId).run?.();
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

export const fulfillHumanDesignOrder = async ({
  env,
  orderId,
  checkoutSessionId,
  paymentIntentId,
}: {
  env: RuntimeEnv;
  orderId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
}) => {
  if (!env.DB) throw new Error("Order storage is unavailable.");
  const timestamp = nowIso();
  const order = await env.DB.prepare(`UPDATE ${AP_TABLES.humanDesignOrders}
    SET payment_status = 'paid', business_status = 'confirmed', fulfillment_status = 'queued',
        stripe_checkout_session_id = ?, stripe_payment_intent_id = ?, paid_at = ?, updated_at = ?
    WHERE id = ? AND payment_status != 'paid'
    RETURNING id, order_number, email, payment_status`)
    .bind(checkoutSessionId, paymentIntentId || null, timestamp, timestamp, orderId).first?.() as { id: string; order_number: string; email: string; payment_status: string } | null | undefined;
  if (!order) {
    const existing = await env.DB.prepare(`SELECT payment_status FROM ${AP_TABLES.humanDesignOrders} WHERE id = ? LIMIT 1`)
      .bind(orderId).first?.() as { payment_status: string } | null | undefined;
    if (existing?.payment_status === "paid") return { alreadyFulfilled: true };
    throw new Error("Paid order was not found.");
  }
  await markLeadConvertedBySourceReference({
    env,
    sourceReferenceType: "human_design_order",
    sourceReferenceId: orderId,
    conversionReference: checkoutSessionId,
  });

  const sender = await readSenderSettings(env);
  if (sender.senderEmail) {
    const safeOrderNumber = escapeHtml(order.order_number);
    const customerResult = await sendSesTransactionalEmail({
      env,
      message: {
        to: [{ email: order.email }],
        sender: { email: sender.senderEmail, name: sender.senderName },
        subject: `Your Nine Centres reading is confirmed · ${order.order_number}`,
        html: `<p>Thank you for your purchase.</p><p>Your full Human Design reading is confirmed under <strong>${safeOrderNumber}</strong>. We will contact you at this email address with the next steps.</p>`,
        text: `Thank you for your purchase. Your full Human Design reading is confirmed under ${order.order_number}. We will contact you at this email address with the next steps.`,
        tags: ["human_design_order_paid", "customer"],
      },
    });
    if (customerResult.ok) {
      await env.DB.prepare(`UPDATE ${AP_TABLES.humanDesignOrders} SET fulfillment_status = 'notified', fulfilled_at = ?, updated_at = ? WHERE id = ?`)
        .bind(nowIso(), nowIso(), orderId).run?.();
    }
    await sendSesTransactionalEmail({
      env,
      message: {
        to: [{ email: sender.senderEmail }],
        sender: { email: sender.senderEmail, name: sender.senderName },
        subject: `New paid Human Design reading · ${order.order_number}`,
        html: `<p>A new full reading has been paid.</p><p>Order: <strong>${safeOrderNumber}</strong></p>`,
        text: `A new full reading has been paid. Order: ${order.order_number}.`,
        tags: ["human_design_order_paid", "admin"],
      },
    });
  }
  return { alreadyFulfilled: false };
};
