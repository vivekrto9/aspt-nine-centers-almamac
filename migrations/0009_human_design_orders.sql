CREATE TABLE IF NOT EXISTS ap_human_design_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  reading_id TEXT,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  amount_minor INTEGER NOT NULL DEFAULT 9900,
  currency TEXT NOT NULL DEFAULT 'USD',
  business_status TEXT NOT NULL DEFAULT 'new',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  fulfilled_at TEXT,
  FOREIGN KEY (reading_id) REFERENCES ap_human_design_readings(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ap_human_design_orders_email
  ON ap_human_design_orders (normalized_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ap_human_design_orders_payment
  ON ap_human_design_orders (payment_status, updated_at DESC);

DROP VIEW IF EXISTS ap_sales_transactions_v1;
CREATE VIEW ap_sales_transactions_v1 AS
SELECT
  id AS transaction_id,
  order_number AS reference,
  'human_design_reading' AS kind_key,
  'Human Design readings' AS kind_label,
  'full-reading' AS item_key,
  'The full reading' AS item_label,
  NULL AS owner_key,
  NULL AS owner_label,
  amount_minor,
  0 AS refunded_minor,
  currency,
  payment_status,
  'stripe' AS payment_provider,
  business_status,
  fulfillment_status,
  created_at,
  COALESCE(paid_at, '') AS paid_at,
  updated_at
FROM ap_human_design_orders;

DROP VIEW IF EXISTS ap_sales_dimensions_v1;
CREATE VIEW ap_sales_dimensions_v1 AS
SELECT id AS transaction_id, 'report_type' AS dimension_key, 'Report type' AS dimension_label,
  'full-reading' AS value_key, 'The full reading' AS value_label
FROM ap_human_design_orders;
