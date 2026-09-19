CREATE TABLE IF NOT EXISTS ap_business_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO ap_business_settings (key, value_json, updated_at)
SELECT 'payment_preference', '{"value":"AUTO","schemaVersion":1,"revision":1}', datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM ap_business_settings WHERE key = 'payment_preference');
