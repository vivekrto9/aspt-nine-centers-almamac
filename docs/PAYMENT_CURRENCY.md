# Nine Centres Field Almanac Payment Preference

This target keeps its existing Human Design checkout and order table unchanged.
The preference-only scope adds project-owned D1 setting
`ap_business_settings.payment_preference` through migration
`0011_payment_preference.sql`.

Allowed values are `AUTO` and `USD`. New environments persist
`{"value":"AUTO","schemaVersion":1,"revision":1}`. Both `AUTO` and `USD`
resolve to the existing USD/Stripe checkout. The signed service contract is
`GET/PATCH /api/astropages/generated-site/payment-settings/v1`; PATCH accepts
only `payment_preference` and `expectedRevision`, with atomic CAS handling.

No new order, catalog, price, provider, wallet, or currency table is created.
The current independent business prices are `INR 659900` minor units (`₹6,599`)
and `USD 9900` minor units (`$99`). Migration `0015_full_reading_inr_price.sql`
updates INR only and preserves USD. Existing `ap_human_design_orders`, Stripe
checkout, webhook, fulfillment, and historical money behavior remain unchanged.
Product-price editing and AI/MCP
payment-setting tools are outside this scope.

Verification: `pnpm test`, `pnpm verify`, `pnpm typecheck`, `pnpm build`,
`pnpm d1:migrate:local`, and `git diff --check` are required. No deployment,
remote migration, or live payment is authorized.
