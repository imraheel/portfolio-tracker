import { supabase } from '@/lib/supabase/client';

// Interfaces for master data import
interface MasterStock {
  symbol: string;
  companyName?: string;
  company_name?: string;
  sector?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterDeposit {
  amount: number;
  depositDate?: string;
  deposit_date?: string;
  note?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterBuyTransaction {
  symbol: string;
  quantity: number;
  buyRate?: number;
  buy_rate?: number;
  totalCost?: number;
  total_cost?: number;
  buyDate?: string;
  buy_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterSellTransaction {
  symbol: string;
  quantity: number;
  sellRate?: number;
  sell_rate?: number;
  totalProceeds?: number;
  total_proceeds?: number;
  realizedGainLoss?: number;
  realized_gain_loss?: number;
  sellDate?: string;
  sell_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterDividend {
  symbol: string;
  dividendAmount?: number;
  dividend_amount?: number;
  dividendDate?: string;
  dividend_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterStockPrice {
  symbol: string;
  currentPrice?: number;
  current_price?: number;
  updatedAt?: string;
  updated_at?: string;
}

interface MasterData {
  version: string;
  exportDate: string;
  stocks: MasterStock[];
  deposits: MasterDeposit[];
  buyTransactions: MasterBuyTransaction[];
  sellTransactions: MasterSellTransaction[];
  dividends: MasterDividend[];
  stockPrices: MasterStockPrice[];
}

export async function exportDataAsJson() {
  try {
    // Fetch all data from Supabase
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .order('id');
    
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('*')
      .order('id');
    
    const { data: buyTransactions, error: buyError } = await supabase
      .from('stock_buy_transactions')
      .select('*')
      .order('id');
    
    const { data: sellTransactions, error: sellError } = await supabase
      .from('stock_sell_transactions')
      .select('*')
      .order('id');
    
    const { data: dividends, error: dividendsError } = await supabase
      .from('dividends')
      .select('*')
      .order('id');
    
    const { data: stockPrices, error: pricesError } = await supabase
      .from('stock_prices')
      .select('*')
      .order('id');

    if (depositsError || stocksError || buyError || sellError || dividendsError || pricesError) {
      throw new Error('Failed to fetch data from database');
    }

    // Create a symbol-based map for portability
    const stockMap = new Map(stocks?.map(s => [s.id, s.symbol]) || []);

    const masterData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      stocks: (stocks || []).map(({ id: _id, ...rest }) => ({ ...rest })),
      deposits: (deposits || []).map(({ id: _id, ...rest }) => ({ 
        ...rest,
        amount: Number(rest.amount)
      })),
      buyTransactions: (buyTransactions || []).map(({ id: _id, stock_id, ...rest }) => ({ 
        ...rest,
        symbol: stockMap.get(stock_id),
        buyRate: Number(rest.buy_rate),
        totalCost: Number(rest.total_cost)
      })),
      sellTransactions: (sellTransactions || []).map(({ id: _id, stock_id, ...rest }) => ({ 
        ...rest,
        symbol: stockMap.get(stock_id),
        sellRate: Number(rest.sell_rate),
        totalProceeds: Number(rest.total_proceeds),
        realizedGainLoss: Number(rest.realized_gain_loss)
      })),
      dividends: (dividends || []).map(({ id: _id, stock_id, ...rest }) => ({ 
        ...rest,
        symbol: stockMap.get(stock_id),
        dividendAmount: Number(rest.dividend_amount)
      })),
      stockPrices: (stockPrices || []).map(({ id: _id, stock_id, ...rest }) => ({ 
        ...rest,
        symbol: stockMap.get(stock_id),
        currentPrice: Number(rest.current_price)
      })),
    };

    return { 
      success: true, 
      data: JSON.stringify(masterData, null, 2),
      filename: `psit_backup_${new Date().toISOString().split('T')[0]}.txt`
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to export data.' };
  }
}

export async function importDataFromJson(jsonString: string) {
  try {
    const masterData = JSON.parse(jsonString) as MasterData;

    if (!masterData.stocks || !masterData.deposits) {
      throw new Error('Invalid backup file format.');
    }

    // 1. Clear all existing data in reverse order of dependencies
    await supabase.from('dividends').delete().neq('id', 0);
    await supabase.from('stock_sell_transactions').delete().neq('id', 0);
    await supabase.from('stock_buy_transactions').delete().neq('id', 0);
    await supabase.from('stock_prices').delete().neq('id', 0);
    await supabase.from('deposits').delete().neq('id', 0);
    await supabase.from('stocks').delete().neq('id', 0);

    // 2. Insert Stocks first to generate new IDs
    const stocksToInsert = masterData.stocks.map((s: MasterStock) => ({
      symbol: s.symbol,
      company_name: s.companyName || s.company_name,
      sector: s.sector,
      created_at: s.createdAt || s.created_at
    }));

    const { data: insertedStocks, error: stocksError } = await supabase
      .from('stocks')
      .insert(stocksToInsert)
      .select();

    if (stocksError) throw stocksError;

    // Create symbol to ID mapping
    const symbolToIdMap = new Map(insertedStocks?.map(s => [s.symbol, s.id]) || []);

    // 3. Insert remaining data using the new ID map
    const depositsToInsert = masterData.deposits.map((d: MasterDeposit) => ({
      amount: d.amount,
      deposit_date: d.depositDate || d.deposit_date,
      note: d.note,
      created_at: d.createdAt || d.created_at
    }));

    const buyTransactionsToInsert = masterData.buyTransactions.map((t: MasterBuyTransaction) => ({
      stock_id: symbolToIdMap.get(t.symbol),
      quantity: t.quantity,
      buy_rate: t.buyRate || t.buy_rate,
      total_cost: t.totalCost || t.total_cost,
      buy_date: t.buyDate || t.buy_date,
      notes: t.notes,
      created_at: t.createdAt || t.created_at
    }));

    const sellTransactionsToInsert = masterData.sellTransactions.map((t: MasterSellTransaction) => ({
      stock_id: symbolToIdMap.get(t.symbol),
      quantity: t.quantity,
      sell_rate: t.sellRate || t.sell_rate,
      total_proceeds: t.totalProceeds || t.total_proceeds,
      realized_gain_loss: t.realizedGainLoss || t.realized_gain_loss,
      sell_date: t.sellDate || t.sell_date,
      notes: t.notes,
      created_at: t.createdAt || t.created_at
    }));

    const dividendsToInsert = masterData.dividends.map((d: MasterDividend) => ({
      stock_id: symbolToIdMap.get(d.symbol),
      dividend_amount: d.dividendAmount || d.dividend_amount,
      dividend_date: d.dividendDate || d.dividend_date,
      notes: d.notes,
      created_at: d.createdAt || d.created_at
    }));

    const stockPricesToInsert = masterData.stockPrices.map((p: MasterStockPrice) => ({
      stock_id: symbolToIdMap.get(p.symbol),
      current_price: p.currentPrice || p.current_price,
      updated_at: p.updatedAt || p.updated_at
    }));

    // Insert all data in parallel
    const [
      { error: depositsError },
      { error: buyError },
      { error: sellError },
      { error: dividendsError },
      { error: pricesError }
    ] = await Promise.all([
      supabase.from('deposits').insert(depositsToInsert),
      supabase.from('stock_buy_transactions').insert(buyTransactionsToInsert),
      supabase.from('stock_sell_transactions').insert(sellTransactionsToInsert),
      supabase.from('dividends').insert(dividendsToInsert),
      supabase.from('stock_prices').insert(stockPricesToInsert)
    ]);

    if (depositsError || buyError || sellError || dividendsError || pricesError) {
      throw new Error('Failed to insert data');
    }

    return { success: true, message: 'Master data imported successfully!' };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
