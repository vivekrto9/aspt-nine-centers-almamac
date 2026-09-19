CREATE TABLE IF NOT EXISTS ap_human_design_offers (
  offer_key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_inr_cents INTEGER,
  price_usd_cents INTEGER,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  updated_at TEXT NOT NULL
);

INSERT INTO ap_human_design_offers
  (offer_key, title, description, price_inr_cents, price_usd_cents, active, updated_at)
SELECT 'full-reading', 'The full reading',
  'A complete Human Design reading with recording, chart file, and notes.',
  16500, 9900, 1, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM ap_human_design_offers WHERE offer_key = 'full-reading');
