ALTER TABLE ap_human_design_orders ADD COLUMN razorpay_order_id TEXT;
ALTER TABLE ap_human_design_orders ADD COLUMN razorpay_payment_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ap_human_design_orders_razorpay_order ON ap_human_design_orders (razorpay_order_id);
