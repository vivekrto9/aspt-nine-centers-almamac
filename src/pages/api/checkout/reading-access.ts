import type { APIRoute } from "astro";
import { getPaidHumanDesignReadingAccess } from "../../../server/capabilities/vendor/astropages-capabilities/human-design-orders.ts";
import { getRuntimeEnv } from "../../../server/generated-site/request.ts";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const readingId = new URL(context.request.url).searchParams.get("reading_id") || "";
  if (!/^hd_chart_[A-Za-z0-9]+$/.test(readingId)) {
    return Response.json({ ok: false, paid: false, message: "Chart reference is invalid." }, { status: 400 });
  }

  const access = await getPaidHumanDesignReadingAccess({ env: await getRuntimeEnv(context), readingId });
  return Response.json({
    ok: true,
    paid: Boolean(access),
    orderNumber: access?.orderNumber || undefined,
    chartUrl: access ? `/human-design/${encodeURIComponent(readingId)}#bodygraph` : undefined,
  }, { headers: { "cache-control": "private, no-store" } });
};

export const ALL: APIRoute = async () => new Response("Method not allowed.", { status: 405 });
