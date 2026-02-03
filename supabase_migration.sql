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

-- Mutual Funds Tables
CREATE TABLE mutual_funds (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  current_market_value DECIMAL(15, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mutual_fund_purchases (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER NOT NULL REFERENCES mutual_funds(id) ON DELETE CASCADE,
  amount DECIMAL(15, 4) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mutual_fund_withdrawals (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER NOT NULL REFERENCES mutual_funds(id) ON DELETE CASCADE,
  amount DECIMAL(15, 4) NOT NULL,
  withdrawal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crypto Tables
CREATE TABLE cryptocurrencies (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  current_total_value DECIMAL(15, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crypto_purchases (
  id SERIAL PRIMARY KEY,
  crypto_id INTEGER NOT NULL REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  amount_pkr DECIMAL(15, 4) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crypto_withdrawals (
  id SERIAL PRIMARY KEY,
  crypto_id INTEGER NOT NULL REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  amount_pkr DECIMAL(15, 4) NOT NULL,
  withdrawal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for new tables
CREATE INDEX idx_mutual_fund_purchases_fund ON mutual_fund_purchases(fund_id);
CREATE INDEX idx_mutual_fund_purchases_date ON mutual_fund_purchases(purchase_date);
CREATE INDEX idx_mutual_fund_withdrawals_fund ON mutual_fund_withdrawals(fund_id);
CREATE INDEX idx_mutual_fund_withdrawals_date ON mutual_fund_withdrawals(withdrawal_date);
CREATE INDEX idx_crypto_purchases_crypto ON crypto_purchases(crypto_id);
CREATE INDEX idx_crypto_purchases_date ON crypto_purchases(purchase_date);
CREATE INDEX idx_crypto_withdrawals_crypto ON crypto_withdrawals(crypto_id);
CREATE INDEX idx_crypto_withdrawals_date ON crypto_withdrawals(withdrawal_date);

-- Enable RLS for new tables
ALTER TABLE mutual_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_fund_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_fund_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "Allow all operations on mutual_funds" ON mutual_funds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on mutual_fund_purchases" ON mutual_fund_purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on mutual_fund_withdrawals" ON mutual_fund_withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on cryptocurrencies" ON cryptocurrencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on crypto_purchases" ON crypto_purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on crypto_withdrawals" ON crypto_withdrawals FOR ALL USING (true) WITH CHECK (true);
