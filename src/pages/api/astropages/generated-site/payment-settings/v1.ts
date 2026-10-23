import type { APIRoute } from "astro";
import { verifyPaymentSettingsJwt } from "../../../../../server/aggregator/admin-sso.ts";
import { PaymentPreferenceError, paymentPreferences, readPaymentPreference, updatePaymentPreference } from "../../../../../server/aggregator/payment-preference.ts";
import { getRuntimeEnv } from "../../../../../server/generated-site/request.ts";

export const prerender = false;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const fail = (status: number, code: string, message: string) => json({ status: "error", code, message }, status);

const handle: APIRoute = async (context) => {
  const env = await getRuntimeEnv(context);
  const request = context.request;
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  let claims;
  try { claims = await verifyPaymentSettingsJwt(token, env.ASTROPAGES_SSO_PUBLIC_JWK); } catch { return fail(401, "PAYMENT_UNAUTHORIZED", "A valid payment-settings token is required."); }
  const projectId = env.ASTROPAGES_PROJECT_ID;
  const environment = env.ASTROPAGES_SITE_ENVIRONMENT;
  if (typeof projectId !== "string" || !projectId || (environment !== "preview" && environment !== "production")) return fail(503, "PAYMENT_SETTINGS_UNAVAILABLE", "Payment runtime target is not configured.");
  if (claims.projectId !== projectId || claims.environment !== environment || claims.method !== request.method || claims.path !== new URL(request.url).pathname) return fail(403, "PAYMENT_FORBIDDEN", "Payment-settings token target does not match.");
  if (request.method === "PATCH" && !["owner", "admin"].includes(claims.role)) return fail(403, "PAYMENT_FORBIDDEN", "Only owners and admins can change payment preference.");
  let bodyText = "";
  if (request.method === "PATCH") bodyText = await request.text();
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(bodyText)))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== claims.bodyHash) return fail(403, "PAYMENT_FORBIDDEN", "Payment-settings body does not match the signed request.");
  try {
    const setting = request.method === "PATCH" ? await updatePaymentPreference(env, JSON.parse(bodyText)) : await readPaymentPreference(env);
    return json({ data: { supported: true, contractVersion: "payment-settings.v1", projectId, environment, ...setting, allowedValues: paymentPreferences } });
  } catch (error) {
    if (error instanceof PaymentPreferenceError) return fail(error.status, error.code, error.message);
    return fail(503, "PAYMENT_SETTINGS_UNAVAILABLE", "Payment settings could not be read or saved.");
  }
};
export const GET = handle;
export const PATCH = handle;
