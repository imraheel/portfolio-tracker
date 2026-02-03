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

interface MasterMutualFund {
  symbol: string;
  name: string;
  description?: string;
  currentMarketValue?: number;
  current_market_value?: number;
  createdAt?: string;
  created_at?: string;
}

interface MasterMutualFundPurchase {
  symbol: string;
  amount: number;
  purchaseDate?: string;
  purchase_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterMutualFundWithdrawal {
  symbol: string;
  amount: number;
  withdrawalDate?: string;
  withdrawal_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterCryptocurrency {
  symbol: string;
  name: string;
  currentTotalValue?: number;
  current_total_value?: number;
  createdAt?: string;
  created_at?: string;
}

interface MasterCryptoPurchase {
  symbol: string;
  amountPkr?: number;
  amount_pkr?: number;
  purchaseDate?: string;
  purchase_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

interface MasterCryptoWithdrawal {
  symbol: string;
  amountPkr?: number;
  amount_pkr?: number;
  withdrawalDate?: string;
  withdrawal_date?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
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
  mutualFunds: MasterMutualFund[];
  mutualFundPurchases: MasterMutualFundPurchase[];
  mutualFundWithdrawals: MasterMutualFundWithdrawal[];
  cryptocurrencies: MasterCryptocurrency[];
  cryptoPurchases: MasterCryptoPurchase[];
  cryptoWithdrawals: MasterCryptoWithdrawal[];
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
    
    const { data: mutualFunds, error: mutualFundsError } = await supabase
      .from('mutual_funds')
      .select('*')
      .order('id');
    
    const { data: mutualFundPurchases, error: mutualFundPurchasesError } = await supabase
      .from('mutual_fund_purchases')
      .select('*')
      .order('id');
    
    const { data: mutualFundWithdrawals, error: mutualFundWithdrawalsError } = await supabase
      .from('mutual_fund_withdrawals')
      .select('*')
      .order('id');
    
    const { data: cryptocurrencies, error: cryptocurrenciesError } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .order('id');
    
    const { data: cryptoPurchases, error: cryptoPurchasesError } = await supabase
      .from('crypto_purchases')
      .select('*')
      .order('id');
    
    const { data: cryptoWithdrawals, error: cryptoWithdrawalsError } = await supabase
      .from('crypto_withdrawals')
      .select('*')
      .order('id');

    if (depositsError || stocksError || buyError || sellError || dividendsError || pricesError ||
        mutualFundsError || mutualFundPurchasesError || mutualFundWithdrawalsError ||
        cryptocurrenciesError || cryptoPurchasesError || cryptoWithdrawalsError) {
      throw new Error('Failed to fetch data from database');
    }

    // Create symbol-based maps for portability
    const stockMap = new Map(stocks?.map(s => [s.id, s.symbol]) || []);
    const fundMap = new Map(mutualFunds?.map(f => [f.id, f.symbol]) || []);
    const cryptoMap = new Map(cryptocurrencies?.map(c => [c.id, c.symbol]) || []);

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
      mutualFunds: (mutualFunds || []).map(({ id: _id, ...rest }) => ({ 
        ...rest,
        currentMarketValue: Number(rest.current_market_value)
      })),
      mutualFundPurchases: (mutualFundPurchases || []).map(({ id: _id, fund_id, ...rest }) => ({ 
        ...rest,
        symbol: fundMap.get(fund_id),
        amount: Number(rest.amount)
      })),
      mutualFundWithdrawals: (mutualFundWithdrawals || []).map(({ id: _id, fund_id, ...rest }) => ({ 
        ...rest,
        symbol: fundMap.get(fund_id),
        amount: Number(rest.amount)
      })),
      cryptocurrencies: (cryptocurrencies || []).map(({ id: _id, ...rest }) => ({ 
        ...rest,
        currentTotalValue: Number(rest.current_total_value)
      })),
      cryptoPurchases: (cryptoPurchases || []).map(({ id: _id, crypto_id, ...rest }) => ({ 
        ...rest,
        symbol: cryptoMap.get(crypto_id),
        amountPkr: Number(rest.amount_pkr)
      })),
      cryptoWithdrawals: (cryptoWithdrawals || []).map(({ id: _id, crypto_id, ...rest }) => ({ 
        ...rest,
        symbol: cryptoMap.get(crypto_id),
        amountPkr: Number(rest.amount_pkr)
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
    await supabase.from('crypto_withdrawals').delete().neq('id', 0);
    await supabase.from('crypto_purchases').delete().neq('id', 0);
    await supabase.from('cryptocurrencies').delete().neq('id', 0);
    await supabase.from('mutual_fund_withdrawals').delete().neq('id', 0);
    await supabase.from('mutual_fund_purchases').delete().neq('id', 0);
    await supabase.from('mutual_funds').delete().neq('id', 0);
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

    // Create symbol to ID mapping for stocks
    const symbolToIdMap = new Map(insertedStocks?.map(s => [s.symbol, s.id]) || []);

    // 2b. Insert Mutual Funds to generate new IDs
    const mutualFundsToInsert = (masterData.mutualFunds || []).map((f: MasterMutualFund) => ({
      symbol: f.symbol,
      name: f.name,
      description: f.description,
      current_market_value: f.currentMarketValue || f.current_market_value,
      created_at: f.createdAt || f.created_at
    }));

    const { data: insertedMutualFunds, error: mutualFundsError } = await supabase
      .from('mutual_funds')
      .insert(mutualFundsToInsert)
      .select();

    if (mutualFundsError) throw mutualFundsError;

    // Create symbol to ID mapping for mutual funds
    const fundSymbolToIdMap = new Map(insertedMutualFunds?.map(f => [f.symbol, f.id]) || []);

    // 2c. Insert Cryptocurrencies to generate new IDs
    const cryptocurrenciesToInsert = (masterData.cryptocurrencies || []).map((c: MasterCryptocurrency) => ({
      symbol: c.symbol,
      name: c.name,
      current_total_value: c.currentTotalValue || c.current_total_value,
      created_at: c.createdAt || c.created_at
    }));

    const { data: insertedCryptocurrencies, error: cryptocurrenciesError } = await supabase
      .from('cryptocurrencies')
      .insert(cryptocurrenciesToInsert)
      .select();

    if (cryptocurrenciesError) throw cryptocurrenciesError;

    // Create symbol to ID mapping for cryptocurrencies
    const cryptoSymbolToIdMap = new Map(insertedCryptocurrencies?.map(c => [c.symbol, c.id]) || []);

    // 3. Insert remaining data using the new ID maps
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

    const mutualFundPurchasesToInsert = (masterData.mutualFundPurchases || []).map((p: MasterMutualFundPurchase) => ({
      fund_id: fundSymbolToIdMap.get(p.symbol),
      amount: p.amount,
      purchase_date: p.purchaseDate || p.purchase_date,
      notes: p.notes,
      created_at: p.createdAt || p.created_at
    }));

    const mutualFundWithdrawalsToInsert = (masterData.mutualFundWithdrawals || []).map((w: MasterMutualFundWithdrawal) => ({
      fund_id: fundSymbolToIdMap.get(w.symbol),
      amount: w.amount,
      withdrawal_date: w.withdrawalDate || w.withdrawal_date,
      notes: w.notes,
      created_at: w.createdAt || w.created_at
    }));

    const cryptoPurchasesToInsert = (masterData.cryptoPurchases || []).map((p: MasterCryptoPurchase) => ({
      crypto_id: cryptoSymbolToIdMap.get(p.symbol),
      amount_pkr: p.amountPkr || p.amount_pkr,
      purchase_date: p.purchaseDate || p.purchase_date,
      notes: p.notes,
      created_at: p.createdAt || p.created_at
    }));

    const cryptoWithdrawalsToInsert = (masterData.cryptoWithdrawals || []).map((w: MasterCryptoWithdrawal) => ({
      crypto_id: cryptoSymbolToIdMap.get(w.symbol),
      amount_pkr: w.amountPkr || w.amount_pkr,
      withdrawal_date: w.withdrawalDate || w.withdrawal_date,
      notes: w.notes,
      created_at: w.createdAt || w.created_at
    }));

    // Insert all data in parallel
    const [
      { error: depositsError },
      { error: buyError },
      { error: sellError },
      { error: dividendsError },
      { error: pricesError },
      { error: mutualFundPurchasesInsertError },
      { error: mutualFundWithdrawalsInsertError },
      { error: cryptoPurchasesInsertError },
      { error: cryptoWithdrawalsInsertError }
    ] = await Promise.all([
      supabase.from('deposits').insert(depositsToInsert),
      supabase.from('stock_buy_transactions').insert(buyTransactionsToInsert),
      supabase.from('stock_sell_transactions').insert(sellTransactionsToInsert),
      supabase.from('dividends').insert(dividendsToInsert),
      supabase.from('stock_prices').insert(stockPricesToInsert),
      supabase.from('mutual_fund_purchases').insert(mutualFundPurchasesToInsert),
      supabase.from('mutual_fund_withdrawals').insert(mutualFundWithdrawalsToInsert),
      supabase.from('crypto_purchases').insert(cryptoPurchasesToInsert),
      supabase.from('crypto_withdrawals').insert(cryptoWithdrawalsToInsert)
    ]);

    if (depositsError || buyError || sellError || dividendsError || pricesError ||
        mutualFundPurchasesInsertError || mutualFundWithdrawalsInsertError ||
        cryptoPurchasesInsertError || cryptoWithdrawalsInsertError) {
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
