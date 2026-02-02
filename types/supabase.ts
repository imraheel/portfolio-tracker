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
