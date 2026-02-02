-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables matching Prisma schema
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(15, 4) NOT NULL,
  deposit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  company_name TEXT,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_buy_transactions (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  buy_rate DECIMAL(15, 4) NOT NULL,
  total_cost DECIMAL(15, 4) NOT NULL,
  buy_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_sell_transactions (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  sell_rate DECIMAL(15, 4) NOT NULL,
  total_proceeds DECIMAL(15, 4) NOT NULL,
  realized_gain_loss DECIMAL(15, 4) NOT NULL,
  sell_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dividends (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  dividend_amount DECIMAL(15, 4) NOT NULL,
  dividend_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_prices (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER UNIQUE NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  current_price DECIMAL(15, 4) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_deposits_date ON deposits(deposit_date);
CREATE INDEX idx_buy_transactions_stock ON stock_buy_transactions(stock_id);
CREATE INDEX idx_buy_transactions_date ON stock_buy_transactions(buy_date);
CREATE INDEX idx_sell_transactions_stock ON stock_sell_transactions(stock_id);
CREATE INDEX idx_sell_transactions_date ON stock_sell_transactions(sell_date);
CREATE INDEX idx_dividends_stock ON dividends(stock_id);
CREATE INDEX idx_dividends_date ON dividends(dividend_date);

-- Enable Row Level Security (RLS)
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_buy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_sell_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on deposits" ON deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stocks" ON stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on buy transactions" ON stock_buy_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sell transactions" ON stock_sell_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on dividends" ON dividends FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock prices" ON stock_prices FOR ALL USING (true) WITH CHECK (true);
