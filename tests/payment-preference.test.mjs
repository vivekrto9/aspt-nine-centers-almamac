import assert from "node:assert/strict";
import test from "node:test";

test("preference scope resolves AUTO by trusted geography and routes providers", async () => {
  const { paymentPreferences, providerForPaymentCurrency, resolvePaymentCurrency } = await import("../src/server/aggregator/payment-preference.ts");
  assert.deepEqual(paymentPreferences, ["USD", "INR", "AUTO"]);
  assert.equal(resolvePaymentCurrency("AUTO", "IN"), "INR");
  assert.equal(resolvePaymentCurrency("AUTO"), "USD");
  assert.equal(providerForPaymentCurrency("USD"), "stripe");
  assert.equal(providerForPaymentCurrency("INR"), "razorpay");
});

test("preference migration creates only the project setting with AUTO default", async () => {
  const { readFileSync } = await import("node:fs");
  const migration = readFileSync(new URL("../migrations/0011_payment_preference.sql", import.meta.url), "utf8");
  assert.match(migration, /ap_business_settings/);
  assert.match(migration, /payment_preference/);
  assert.match(migration, /AUTO/);
  assert.doesNotMatch(migration, /human_design_orders|price_inr|price_usd|razorpay/i);
});
