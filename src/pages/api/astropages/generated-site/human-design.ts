import type { APIRoute } from "astro";
import { createHumanDesignChart, getHumanDesignReading, humanDesignFeature } from "../../../../server/capabilities/vendor/astropages-capabilities/human-design-api.ts";
import { getRuntimeEnv, readJsonBody, requirePost } from "../../../../server/generated-site/request.ts";
import { errorResponse } from "../../../../server/generated-site/responses.ts";
import { readSenderSettings, sendSesTransactionalEmail } from "../../../../server/aggregator/notifications/ses.ts";
import { normalizeHumanDesignView } from "../../../../server/capabilities/vendor/astropages-capabilities/human-design-view.ts";

export const prerender = false;
export const GET: APIRoute = async (context) => {
  const readingId = new URL(context.request.url).searchParams.get("readingId") || "";
  const reading = await getHumanDesignReading({ env: await getRuntimeEnv(context), readingId, kind: "chart" });
  if (!reading) return errorResponse(humanDesignFeature, "Saved chart was not found.", 404);
  const profile = reading.profile && typeof reading.profile === "object" ? reading.profile as Record<string, unknown> : {};
  return Response.json({
    ok: true,
    readingId: reading.readingId,
    kind: reading.kind,
    locale: reading.locale,
    createdAt: reading.createdAt,
    result: reading.result,
    profile: {
      name: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      birthPlace: profile.birthPlace,
    },
  }, { headers: { "cache-control": "private, no-store" } });
};
export const POST: APIRoute = async (context) => {
  const methodError = requirePost(context.request); if (methodError) return methodError;
  const parsed = await readJsonBody(context.request); if (!parsed.ok) return parsed.response;
  try {
    const env = await getRuntimeEnv(context);
    const locale = (context.request.headers.get("accept-language") || "en").split(",", 1)[0].split("-", 1)[0].toLowerCase();
    const created = await createHumanDesignChart({ env, body: parsed.body, locale });
    const email = typeof parsed.body.email === "string" ? parsed.body.email.trim().toLowerCase() : "";
    const sender = email ? await readSenderSettings(env) : { senderEmail: "", senderName: "Nine Centres" };
    if (email && sender.senderEmail) {
      const requestUrl = new URL(context.request.url);
      const configuredOrigin = typeof env.SITE_ORIGIN === "string" ? env.SITE_ORIGIN.trim() : "";
      let origin = requestUrl.origin;
      try { if (configuredOrigin) origin = new URL(configuredOrigin).origin; } catch {}
      const chartUrl = `${origin}/human-design/${encodeURIComponent(created.readingId)}`;
      await sendSesTransactionalEmail({
        env,
        message: {
          to: [{ email }],
          sender: { email: sender.senderEmail, name: sender.senderName },
          subject: "Your Nine Centres bodygraph is ready",
          html: `<p>Your Human Design bodygraph is ready.</p><p><a href="${chartUrl}">Open your private chart</a></p><p>Keep this link to return to your chart.</p>`,
          text: `Your Human Design bodygraph is ready. Open your private chart: ${chartUrl}\n\nKeep this link to return to your chart.`,
          tags: ["human_design_chart_ready", "customer"],
        },
      });
    }
    return Response.json({ ...created, view: normalizeHumanDesignView(created.result) });
  }
  catch (error) { const message = error instanceof Error ? error.message : "Human Design chart could not be generated."; return errorResponse(humanDesignFeature, message, /configured|storage|temporarily unavailable/i.test(message) ? 503 : /provider/i.test(message) ? 502 : 400); }
};
export const ALL: APIRoute = async () => errorResponse(humanDesignFeature, "Method not allowed.", 405);
