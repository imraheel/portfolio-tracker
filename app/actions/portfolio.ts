'use server';

import { createClient } from '@/lib/supabase/server';

// Database row types
interface BuyTransaction {
  id: number;
  stock_id: number;
  quantity: number;
  buy_rate: number | string;
  total_cost: number | string;
  buy_date: string;
  notes?: string;
  created_at?: string;
}

interface SellTransaction {
  id: number;
  stock_id: number;
  quantity: number;
  sell_rate: number | string;
  total_proceeds: number | string;
  realized_gain_loss: number | string;
  sell_date: string;
  notes?: string;
  created_at?: string;
}

interface Dividend {
  id: number;
  stock_id: number;
  dividend_amount: number | string;
  dividend_date: string;
  notes?: string;
  created_at?: string;
}

interface StockPrice {
  id: number;
  stock_id: number;
  current_price: number | string;
  updated_at?: string;
}

interface StockWithRelations {
  id: number;
  symbol: string;
  company_name?: string;
  sector?: string;
  created_at?: string;
  stock_buy_transactions?: BuyTransaction[];
  stock_sell_transactions?: SellTransaction[];
  dividends?: Dividend[];
  stock_prices?: StockPrice;
}

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

export async function getPortfolioMetrics(): Promise<HoldingMetric[]> {
  const supabase = await createClient();

  // Get all stocks with their related data
  const { data: stocks, error: stocksError } = await supabase
    .from('stocks')
    .select(`
      *,
      stock_buy_transactions (*),
      stock_sell_transactions (*),
      dividends (*),
      stock_prices (*)
    `)
    .order('symbol');

  if (stocksError) throw stocksError;

  const metrics: HoldingMetric[] = [];

  for (const stock of (stocks || [])) {
    const buyTransactions = stock.stock_buy_transactions || [];
    const sellTransactions = stock.stock_sell_transactions || [];
    const dividends = stock.dividends || [];
    const currentPriceData = stock.stock_prices;

    const totalBuyQty = buyTransactions.reduce((sum: number, tx: BuyTransaction) => sum + tx.quantity, 0);
    const totalSellQty = sellTransactions.reduce((sum: number, tx: SellTransaction) => sum + tx.quantity, 0);
    const remainingQty = totalBuyQty - totalSellQty;

    const realizedGainLoss = sellTransactions.reduce((sum: number, tx: SellTransaction) => 
      sum + Number(tx.realized_gain_loss), 0);
    
    const totalDividends = dividends.reduce((sum: number, d: Dividend) => 
      sum + Number(d.dividend_amount), 0);
    
    const currentPrice = currentPriceData ? Number(currentPriceData.current_price) : 0;

    let investedAmount = 0;
    let avgBuyPrice = 0;

    if (remainingQty > 0) {
      // FIFO logic to find the cost basis of remaining shares
      const buyLots = buyTransactions.map((tx: BuyTransaction) => ({ 
        ...tx, 
        remaining: tx.quantity,
        buyRate: Number(tx.buy_rate)
      }));
      
      let soldQtyCounter = totalSellQty;
      for (const lot of buyLots) {
        if (soldQtyCounter === 0) break;
        const consume = Math.min(lot.remaining, soldQtyCounter);
        lot.remaining -= consume;
        soldQtyCounter -= consume;
      }

      // Calculate invested amount from the lots that have remaining shares
      for (const lot of buyLots) {
        if (lot.remaining > 0) {
          investedAmount += lot.remaining * lot.buyRate;
        }
      }
      avgBuyPrice = investedAmount / remainingQty;
    }
    
    const currentValue = remainingQty * currentPrice;
    const unrealizedGainLoss = currentValue - investedAmount;

    metrics.push({
      stockId: stock.id,
      symbol: stock.symbol,
      totalBuyQty,
      totalSellQty,
      remainingQty,
      avgBuyPrice,
      investedAmount,
      currentPrice,
      currentValue,
      unrealizedGainLoss,
      realizedGainLoss,
      totalDividends,
    });
  }

  return metrics.filter(m => 
    m.remainingQty > 0 || 
    Math.abs(m.realizedGainLoss) > 0 || 
    Math.abs(m.totalDividends) > 0
  );
}
