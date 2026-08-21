import type { APIRoute } from "astro";
import { resolveSecretBinding } from "../../../server/aggregator/runtime-bindings.ts";
import { getRuntimeEnv, readJsonBody, requirePost } from "../../../server/generated-site/request.ts";
import { errorResponse } from "../../../server/generated-site/responses.ts";
import { attachStripeCheckoutSession, createHumanDesignOrder, failHumanDesignOrder, getPaidHumanDesignReadingAccess } from "../../../server/capabilities/vendor/astropages-capabilities/human-design-orders.ts";

const feature = "nine-centres.checkout.full-reading";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async (context) => {
  const methodError = requirePost(context.request);
  if (methodError) return methodError;

  if (Number(context.request.headers.get("content-length") || 0) > 4096) {
    return errorResponse(feature, "Request is too large.", 413);
  }

  const parsed = await readJsonBody(context.request);
  if (!parsed.ok) return parsed.response;

  const email = typeof parsed.body.email === "string" ? parsed.body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return errorResponse(feature, "Enter a valid email address.", 400);
  }

  const env = await getRuntimeEnv(context);
  const readingId = typeof parsed.body.readingId === "string" ? parsed.body.readingId.trim() : "";
  if (readingId) {
    const paidAccess = await getPaidHumanDesignReadingAccess({ env, readingId });
    if (paidAccess) {
      return Response.json({
        ok: false,
        alreadyPurchased: true,
        message: "You already own the full reading for this chart.",
        orderNumber: paidAccess.orderNumber,
        chartUrl: `/human-design/${encodeURIComponent(readingId)}#bodygraph`,
      }, { status: 409, headers: { "cache-control": "private, no-store" } });
    }
  }
  const stripeSecretKey = await resolveSecretBinding(env, "STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return errorResponse(feature, "Secure checkout is not configured yet.", 503);
  }
  let order;
  try {
    order = await createHumanDesignOrder({
      env,
      email,
      readingId,
      locale: context.request.headers.get("accept-language") || "en",
    });
  } catch (caught) {
    return errorResponse(feature, caught instanceof Error ? caught.message : "Checkout could not be started.", 503);
  }

  const requestUrl = new URL(context.request.url);
  const configuredOrigin = typeof env.SITE_ORIGIN === "string" ? env.SITE_ORIGIN.trim() : "";
  let siteOrigin = requestUrl.origin;
  if (configuredOrigin) {
    try {
      siteOrigin = new URL(configuredOrigin).origin;
    } catch {
      return errorResponse(feature, "Checkout site origin is misconfigured.", 503);
    }
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("ui_mode", "hosted");
  form.set("customer_email", email);
  form.set("customer_creation", "always");
  form.set("client_reference_id", order.id);
  const successPath = order.readingId
    ? `/human-design/${encodeURIComponent(order.readingId)}`
    : "/";
  const successHash = order.readingId ? "#bodygraph" : "#readings";
  form.set("success_url", `${siteOrigin}${successPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}${successHash}`);
  form.set("cancel_url", `${siteOrigin}/?checkout=cancelled#readings`);
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", "9900");
  form.set("line_items[0][price_data][product_data][name]", "The full reading");
  form.set("line_items[0][price_data][product_data][description]", "A complete Human Design reading with recording, chart file, and notes.");
  form.set("line_items[0][quantity]", "1");
  form.set("metadata[offer]", "full-reading");
  form.set("metadata[order_id]", order.id);
  if (order.readingId) form.set("metadata[reading_id]", order.readingId);

  try {
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const payload = await stripeResponse.json() as { id?: string; url?: string; error?: { message?: string } };

    if (!stripeResponse.ok || !payload.url) {
      await failHumanDesignOrder({ env, orderId: order.id });
      console.error("Stripe Checkout Session creation failed", stripeResponse.status, payload.error?.message || "Unknown error");
      return errorResponse(feature, "Secure checkout could not be opened. Please try again.", 502);
    }

    const checkoutUrl = new URL(payload.url);
    if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") {
      await failHumanDesignOrder({ env, orderId: order.id });
      return errorResponse(feature, "Stripe returned an invalid checkout URL.", 502);
    }

    if (payload.id) await attachStripeCheckoutSession({ env, orderId: order.id, sessionId: payload.id });

    return Response.json({ ok: true, url: checkoutUrl.toString(), orderId: order.id });
  } catch (caught) {
    await failHumanDesignOrder({ env, orderId: order.id });
    console.error("Stripe Checkout request failed", caught instanceof Error ? caught.message : "Unknown error");
    return errorResponse(feature, "Secure checkout is temporarily unavailable.", 503);
  }
};
