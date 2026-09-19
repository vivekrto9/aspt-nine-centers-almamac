import type { RuntimeEnv } from "./runtime.ts";

export type PaymentPreference = "USD" | "INR" | "AUTO";
export type PaymentCurrency = "USD" | "INR";
export const paymentPreferences = ["USD", "INR", "AUTO"] as const;

export class PaymentPreferenceError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}

export const isPaymentPreference = (value: unknown): value is PaymentPreference =>
  typeof value === "string" && paymentPreferences.includes(value as PaymentPreference);

export const resolvePaymentCurrency = (preference: PaymentPreference, country?: unknown): PaymentCurrency =>
  preference === "AUTO" ? (String(country || "").toUpperCase() === "IN" ? "INR" : "USD") : preference;

export const providerForPaymentCurrency = (currency: PaymentCurrency) => currency === "INR" ? "razorpay" as const : "stripe" as const;

const parse = (row: { value_json: string } | null) => {
  if (!row) throw new PaymentPreferenceError(503, "PAYMENT_SETTINGS_UNAVAILABLE", "Apply the payment-preference migration before using this feature.");
  let value: unknown;
  try { value = JSON.parse(row.value_json); } catch { value = null; }
  if (!value || typeof value !== "object" || !isPaymentPreference((value as any).value)
    || (value as any).schemaVersion !== 1 || !Number.isSafeInteger((value as any).revision) || (value as any).revision < 1) {
    throw new PaymentPreferenceError(503, "PAYMENT_SETTINGS_UNAVAILABLE", "Stored payment preference is invalid.");
  }
  return { payment_preference: (value as any).value as PaymentPreference, revision: (value as any).revision as number };
};

export const readPaymentPreference = async (env: RuntimeEnv) => {
  if (!env.DB) throw new PaymentPreferenceError(503, "PAYMENT_SETTINGS_UNAVAILABLE", "Payment settings storage is unavailable.");
  return parse(await env.DB.prepare("SELECT value_json FROM ap_business_settings WHERE key = ? LIMIT 1").bind("payment_preference").first?.() as any);
};

export const updatePaymentPreference = async (env: RuntimeEnv, input: unknown) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new PaymentPreferenceError(400, "PAYMENT_INVALID_INPUT", "A preference update object is required.");
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((key) => !["payment_preference", "expectedRevision"].includes(key))
    || !isPaymentPreference(body.payment_preference) || !Number.isSafeInteger(body.expectedRevision)) {
    throw new PaymentPreferenceError(400, "PAYMENT_INVALID_INPUT", "Use USD, INR or AUTO and a valid expectedRevision.");
  }
  const current = await readPaymentPreference(env);
  if (current.revision !== body.expectedRevision) throw new PaymentPreferenceError(409, "PAYMENT_REVISION_CONFLICT", "Reload the current preference before saving.");
  const next = JSON.stringify({ value: body.payment_preference, schemaVersion: 1, revision: current.revision + 1 });
  const result = await env.DB!.prepare("UPDATE ap_business_settings SET value_json = ?, updated_at = ? WHERE key = ? AND json_extract(value_json, '$.revision') = ? RETURNING value_json")
    .bind(next, new Date().toISOString(), "payment_preference", current.revision).first?.() as any;
  if (!result) throw new PaymentPreferenceError(409, "PAYMENT_REVISION_CONFLICT", "Reload the current preference before saving.");
  return parse(result);
};
