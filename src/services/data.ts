import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

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
    const [depositsSnap, stocksSnap, buySnap, sellSnap, dividendsSnap, pricesSnap,
      fundsSnap, fundPurchasesSnap, fundWithdrawalsSnap,
      cryptosSnap, cryptoPurchasesSnap, cryptoWithdrawalsSnap] = await Promise.all([
      getDocs(collection(db, 'deposits')),
      getDocs(collection(db, 'stocks')),
      getDocs(collection(db, 'stock_buy_transactions')),
      getDocs(collection(db, 'stock_sell_transactions')),
      getDocs(collection(db, 'dividends')),
      getDocs(collection(db, 'stock_prices')),
      getDocs(collection(db, 'mutual_funds')),
      getDocs(collection(db, 'mutual_fund_purchases')),
      getDocs(collection(db, 'mutual_fund_withdrawals')),
      getDocs(collection(db, 'cryptocurrencies')),
      getDocs(collection(db, 'crypto_purchases')),
      getDocs(collection(db, 'crypto_withdrawals')),
    ]);

    const masterData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      stocks: stocksSnap.docs.map(d => d.data()),
      deposits: depositsSnap.docs.map(d => {
        const data = d.data() as { amount: number };
        return { ...data, amount: Number(data.amount) };
      }),
      buyTransactions: buySnap.docs.map(d => {
        const data = d.data() as { buy_rate: number; total_cost: number };
        return {
          ...data,
          buyRate: Number(data.buy_rate),
          totalCost: Number(data.total_cost),
        };
      }),
      sellTransactions: sellSnap.docs.map(d => {
        const data = d.data() as { sell_rate: number; total_proceeds: number; realized_gain_loss: number };
        return {
          ...data,
          sellRate: Number(data.sell_rate),
          totalProceeds: Number(data.total_proceeds),
          realizedGainLoss: Number(data.realized_gain_loss),
        };
      }),
      dividends: dividendsSnap.docs.map(d => {
        const data = d.data() as { dividend_amount: number };
        return { ...data, dividendAmount: Number(data.dividend_amount) };
      }),
      stockPrices: pricesSnap.docs.map(d => {
        const data = d.data() as { current_price: number };
        return { ...data, currentPrice: Number(data.current_price) };
      }),
      mutualFunds: fundsSnap.docs.map(d => {
        const data = d.data() as { current_market_value: number };
        return { ...data, currentMarketValue: Number(data.current_market_value) };
      }),
      mutualFundPurchases: fundPurchasesSnap.docs.map(d => d.data()),
      mutualFundWithdrawals: fundWithdrawalsSnap.docs.map(d => d.data()),
      cryptocurrencies: cryptosSnap.docs.map(d => {
        const data = d.data() as { current_total_value: number };
        return { ...data, currentTotalValue: Number(data.current_total_value) };
      }),
      cryptoPurchases: cryptoPurchasesSnap.docs.map(d => d.data()),
      cryptoWithdrawals: cryptoWithdrawalsSnap.docs.map(d => d.data()),
    };

    return {
      success: true,
      data: JSON.stringify(masterData, null, 2),
      filename: `psit_backup_${new Date().toISOString().split('T')[0]}.txt`,
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

    // Clear all existing data
    const collections = [
      'crypto_withdrawals', 'crypto_purchases', 'cryptocurrencies',
      'mutual_fund_withdrawals', 'mutual_fund_purchases', 'mutual_funds',
      'dividends', 'stock_sell_transactions', 'stock_buy_transactions',
      'stock_prices', 'deposits', 'withdrawals', 'stocks',
    ];

    for (const name of collections) {
      const snap = await getDocs(collection(db, name));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(doc(db, name, d.id)));
      await batch.commit();
    }

    // Insert stocks (symbol as doc ID)
    for (const s of masterData.stocks) {
      await setDoc(doc(db, 'stocks', s.symbol), {
        symbol: s.symbol,
        company_name: s.companyName || s.company_name || null,
        sector: s.sector || null,
        created_at: s.createdAt || s.created_at || null,
      });
    }

    // Insert mutual funds (symbol as doc ID)
    for (const f of (masterData.mutualFunds || [])) {
      await setDoc(doc(db, 'mutual_funds', f.symbol), {
        symbol: f.symbol,
        name: f.name,
        description: f.description || null,
        current_market_value: f.currentMarketValue || f.current_market_value || 0,
        created_at: f.createdAt || f.created_at || null,
      });
    }

    // Insert cryptocurrencies (symbol as doc ID)
    for (const c of (masterData.cryptocurrencies || [])) {
      await setDoc(doc(db, 'cryptocurrencies', c.symbol), {
        symbol: c.symbol,
        name: c.name,
        current_total_value: c.currentTotalValue || c.current_total_value || 0,
        created_at: c.createdAt || c.created_at || null,
      });
    }

    // Insert deposits
    for (const d of masterData.deposits) {
      await addDoc(collection(db, 'deposits'), {
        amount: d.amount,
        deposit_date: d.depositDate || d.deposit_date || null,
        note: d.note || null,
        created_at: d.createdAt || d.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert buy transactions
    for (const t of masterData.buyTransactions) {
      await addDoc(collection(db, 'stock_buy_transactions'), {
        symbol: t.symbol,
        quantity: t.quantity,
        buy_rate: t.buyRate || t.buy_rate,
        total_cost: t.totalCost || t.total_cost,
        buy_date: t.buyDate || t.buy_date || null,
        notes: t.notes || null,
        created_at: t.createdAt || t.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert sell transactions
    for (const t of (masterData.sellTransactions || [])) {
      await addDoc(collection(db, 'stock_sell_transactions'), {
        symbol: t.symbol,
        quantity: t.quantity,
        sell_rate: t.sellRate || t.sell_rate,
        total_proceeds: t.totalProceeds || t.total_proceeds,
        realized_gain_loss: t.realizedGainLoss || t.realized_gain_loss,
        sell_date: t.sellDate || t.sell_date || null,
        notes: t.notes || null,
        created_at: t.createdAt || t.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert dividends
    for (const d of masterData.dividends) {
      await addDoc(collection(db, 'dividends'), {
        symbol: d.symbol,
        dividend_amount: d.dividendAmount || d.dividend_amount,
        dividend_date: d.dividendDate || d.dividend_date || null,
        notes: d.notes || null,
        created_at: d.createdAt || d.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert stock prices (symbol as doc ID)
    for (const p of masterData.stockPrices) {
      await setDoc(doc(db, 'stock_prices', p.symbol), {
        symbol: p.symbol,
        current_price: p.currentPrice || p.current_price,
        updated_at: p.updatedAt || p.updated_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert mutual fund purchases
    for (const p of (masterData.mutualFundPurchases || [])) {
      await addDoc(collection(db, 'mutual_fund_purchases'), {
        symbol: p.symbol,
        amount: p.amount,
        purchase_date: p.purchaseDate || p.purchase_date || null,
        notes: p.notes || null,
        created_at: p.createdAt || p.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert mutual fund withdrawals
    for (const w of (masterData.mutualFundWithdrawals || [])) {
      await addDoc(collection(db, 'mutual_fund_withdrawals'), {
        symbol: w.symbol,
        amount: w.amount,
        withdrawal_date: w.withdrawalDate || w.withdrawal_date || null,
        notes: w.notes || null,
        created_at: w.createdAt || w.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert crypto purchases
    for (const p of (masterData.cryptoPurchases || [])) {
      await addDoc(collection(db, 'crypto_purchases'), {
        symbol: p.symbol,
        amount_pkr: p.amountPkr || p.amount_pkr,
        purchase_date: p.purchaseDate || p.purchase_date || null,
        notes: p.notes || null,
        created_at: p.createdAt || p.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    // Insert crypto withdrawals
    for (const w of (masterData.cryptoWithdrawals || [])) {
      await addDoc(collection(db, 'crypto_withdrawals'), {
        symbol: w.symbol,
        amount_pkr: w.amountPkr || w.amount_pkr,
        withdrawal_date: w.withdrawalDate || w.withdrawal_date || null,
        notes: w.notes || null,
        created_at: w.createdAt || w.created_at || Timestamp.now().toDate().toISOString(),
      });
    }

    return { success: true, message: 'Master data imported successfully!' };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
