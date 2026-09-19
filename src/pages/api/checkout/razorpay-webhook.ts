import type { APIRoute } from "astro";
import { resolveSecretBinding } from "../../../server/aggregator/runtime-bindings.ts";
import { fulfillHumanDesignOrder } from "../../../server/capabilities/vendor/astropages-capabilities/human-design-orders.ts";
import { getRuntimeEnv } from "../../../server/generated-site/request.ts";

export const prerender = false;
const encoder = new TextEncoder();
const sign = async (secret: string, value: string) => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
export const POST: APIRoute = async (context) => {
  const env = await getRuntimeEnv(context);
  const secret = await resolveSecretBinding(env, "RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook is not configured.", { status: 503 });
  const body = await context.request.text();
  if ((context.request.headers.get("x-razorpay-signature") || "") !== await sign(secret, body)) return new Response("Invalid signature.", { status: 400 });
  let event: any;
  try { event = JSON.parse(body); } catch { return new Response("Invalid payload.", { status: 400 }); }
  if (event.event !== "payment.captured") return Response.json({ received: true });
  const payment = event.payload?.payment?.entity;
  const order = env.DB ? await (env.DB as any).prepare("SELECT id, amount_minor, currency FROM ap_human_design_orders WHERE razorpay_order_id = ? LIMIT 1").bind(String(payment?.order_id || "")).first?.() : null;
  if (!order || Number(payment?.amount) !== Number(order.amount_minor) || payment?.currency !== "INR" || order.currency !== "INR") return new Response("Payment does not match the order.", { status: 400 });
  await fulfillHumanDesignOrder({ env, orderId: order.id, checkoutSessionId: String(payment.order_id), paymentIntentId: String(payment.id || ""), provider: "razorpay" });
  return Response.json({ received: true });
};
