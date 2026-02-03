// Type definitions for Supabase database tables

export interface Deposit {
  id: number;
  amount: number;
  deposit_date: string;
  note: string | null;
  created_at: string;
}

export interface Stock {
  id: number;
  symbol: string;
  company_name: string | null;
  sector: string | null;
  created_at: string;
}

export interface StockBuyTransaction {
  id: number;
  stock_id: number;
  quantity: number;
  buy_rate: number;
  total_cost: number;
  buy_date: string;
  notes: string | null;
  created_at: string;
  stock?: {
    symbol: string;
  };
}

export interface StockSellTransaction {
  id: number;
  stock_id: number;
  quantity: number;
  sell_rate: number;
  total_proceeds: number;
  realized_gain_loss: number;
  sell_date: string;
  notes: string | null;
  created_at: string;
  stock?: {
    symbol: string;
  };
}

export interface Dividend {
  id: number;
  stock_id: number;
  dividend_amount: number;
  dividend_date: string;
  notes: string | null;
  created_at: string;
  stock?: {
    symbol: string;
  };
}

export interface StockPrice {
  id: number;
  stock_id: number;
  current_price: number;
  updated_at: string;
}

// Extended interfaces with relations
export interface StockWithRelations extends Stock {
  buy_transactions?: StockBuyTransaction[];
  sell_transactions?: StockSellTransaction[];
  dividends?: Dividend[];
  stock_prices?: StockPrice | null;
}

// Portfolio metric interface
export interface HoldingMetric {
  stockId: number;
  symbol: string;
  
  totalBuyQty: number;
  totalSellQty: number;
  remainingQty: number;
  
  avgBuyPrice: number;
  investedAmount: number;
  
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  
  realizedGainLoss: number;
  totalDividends: number;
}

// Mutual Funds
export interface MutualFund {
  id: number;
  symbol: string;
  name: string;
  description: string | null;
  current_market_value: number;
  created_at: string;
}

export interface MutualFundPurchase {
  id: number;
  fund_id: number;
  amount: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  fund?: { symbol: string; name: string };
}

export interface MutualFundWithdrawal {
  id: number;
  fund_id: number;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  fund?: { symbol: string; name: string };
}

export interface MutualFundMetrics {
  fundId: number;
  symbol: string;
  name: string;
  totalPurchases: number;
  totalWithdrawals: number;
  netInvestment: number;
  currentMarketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

// Crypto
export interface Cryptocurrency {
  id: number;
  symbol: string;
  name: string;
  current_total_value: number;
  created_at: string;
}

export interface CryptoPurchase {
  id: number;
  crypto_id: number;
  amount_pkr: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency?: { symbol: string; name: string };
}

export interface CryptoWithdrawal {
  id: number;
  crypto_id: number;
  amount_pkr: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency?: { symbol: string; name: string };
}

export interface CryptoMetrics {
  cryptoId: number;
  symbol: string;
  name: string;
  totalPurchases: number;
  totalWithdrawals: number;
  netInvestment: number;
  currentTotalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}
