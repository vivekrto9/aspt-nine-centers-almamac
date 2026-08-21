import type { APIRoute } from "astro";
import { resolveSecretBinding } from "../../../server/aggregator/runtime-bindings.ts";
import { fulfillHumanDesignOrder } from "../../../server/capabilities/vendor/astropages-capabilities/human-design-orders.ts";
import { getRuntimeEnv } from "../../../server/generated-site/request.ts";

export const prerender = false;
const encoder = new TextEncoder();

const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const sign = async (secret: string, value: string) => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
};

const same = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
};

export const verifyStripeSignature = async (body: string, header: string, secret: string) => {
  const entries = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = entries.find(([key]) => key === "t")?.[1] || "";
  const signatures = entries.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = await sign(secret, `${timestamp}.${body}`);
  return signatures.some((signature) => same(signature, expected));
};

export const POST: APIRoute = async (context) => {
  const env = await getRuntimeEnv(context);
  const webhookSecret = await resolveSecretBinding(env, "STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) return new Response("Webhook is not configured.", { status: 503 });
  const contentLength = Number(context.request.headers.get("content-length") || 0);
  if (contentLength > 256_000) return new Response("Request is too large.", { status: 413 });
  const rawBody = await context.request.text();
  const signature = context.request.headers.get("stripe-signature") || "";
  if (!await verifyStripeSignature(rawBody, signature, webhookSecret)) return new Response("Invalid signature.", { status: 400 });

  let event: Record<string, any>;
  try { event = JSON.parse(rawBody); } catch { return new Response("Invalid payload.", { status: 400 }); }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(String(event.type))) {
    return Response.json({ received: true });
  }
  const session = event.data?.object;
  const orderId = String(session?.metadata?.order_id || session?.client_reference_id || "");
  const sessionId = String(session?.id || "");
  const paymentStatus = String(session?.payment_status || "");
  if (!/^hd_order_[A-Za-z0-9]+$/.test(orderId) || !/^cs_/.test(sessionId)) return new Response("Invalid order reference.", { status: 400 });
  if (paymentStatus === "unpaid") return Response.json({ received: true });
  if (Number(session?.amount_total) !== 9900 || String(session?.currency || "").toLowerCase() !== "usd") {
    return new Response("Paid amount does not match the order.", { status: 400 });
  }
  try {
    await fulfillHumanDesignOrder({
      env,
      orderId,
      checkoutSessionId: sessionId,
      paymentIntentId: String(session?.payment_intent || ""),
    });
    return Response.json({ received: true });
  } catch {
    return new Response("Fulfilment failed.", { status: 500 });
  }
};

export const ALL: APIRoute = async () => new Response("Method not allowed.", { status: 405 });
