-- Business price update: change INR only; preserve the independently configured USD price.
UPDATE ap_human_design_offers
SET price_inr_cents = 659900, updated_at = datetime('now')
WHERE offer_key = 'full-reading';
