CREATE TABLE IF NOT EXISTS ap_human_design_readings (
  id TEXT PRIMARY KEY,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('chart', 'compatibility', 'transit')),
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'ready',
  input_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ap_human_design_readings_type
  ON ap_human_design_readings (reading_type, status, updated_at DESC);
