-- Create withdrawals table for stock wallet
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  withdrawal_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for date-based queries
CREATE INDEX idx_withdrawals_date ON withdrawals(withdrawal_date DESC);

-- Add RLS policies (if RLS is enabled)
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON withdrawals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all operations for anon users (for development)
CREATE POLICY "Enable all operations for anon users" ON withdrawals
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
