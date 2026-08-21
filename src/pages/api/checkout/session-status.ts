import type { APIRoute } from "astro";
import { getHumanDesignOrderByCheckoutSession } from "../../../server/capabilities/vendor/astropages-capabilities/human-design-orders.ts";
import { getRuntimeEnv } from "../../../server/generated-site/request.ts";

export const prerender = false;
export const GET: APIRoute = async (context) => {
  const sessionId = new URL(context.request.url).searchParams.get("session_id") || "";
  const order = await getHumanDesignOrderByCheckoutSession({ env: await getRuntimeEnv(context), sessionId });
  if (!order) return Response.json({ ok: false, message: "Payment status is not available yet." }, { status: 404 });
  return Response.json({
    ok: true,
    orderNumber: order.order_number,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
  }, { headers: { "cache-control": "private, no-store" } });
};
