import type { RuntimeEnv } from "./runtime.ts";
import { paymentCountryFromRequest } from "./payment-country.ts";
import { readPaymentPreference, resolvePaymentCurrency, providerForPaymentCurrency, type PaymentCurrency } from "./payment-preference.ts";

export type PaymentQuote = { offerKey: string; title: string; description: string; amountMinor: number; currency: PaymentCurrency; provider: "stripe" | "razorpay"; revision: number };

export const getPaymentQuote = async (env: RuntimeEnv, request: Request | undefined, offerKey = "full-reading"): Promise<PaymentQuote> => {
  if (!env.DB) throw new Error("Payment storage is unavailable.");
  const preference = await readPaymentPreference(env);
  const country = paymentCountryFromRequest(request as any, import.meta.env?.DEV === true);
  const currency = resolvePaymentCurrency(preference.payment_preference, country);
  const row = await env.DB.prepare("SELECT offer_key, title, description, price_inr_cents, price_usd_cents FROM ap_human_design_offers WHERE offer_key = ? AND active = 1 LIMIT 1").bind(offerKey).first?.() as any;
  const amountMinor = row?.[currency === "USD" ? "price_usd_cents" : "price_inr_cents"];
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) throw new Error(`${currency} pricing is not configured for this reading.`);
  return { offerKey, title: String(row.title), description: String(row.description), amountMinor, currency, provider: providerForPaymentCurrency(currency), revision: preference.revision };
};

export const formatPaymentAmount = (amountMinor: number, currency: PaymentCurrency) => new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amountMinor / 100);
