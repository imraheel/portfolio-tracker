import { db } from '@/lib/firebase/client';
import { z } from 'zod';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getWalletBalance } from './wallet';

const BuyTransactionSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  quantity: z.number().int().positive(),
  buyRate: z.number().positive(),
  buyDate: z.date(),
  notes: z.string().optional(),
});

const SellTransactionSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  quantity: z.number().int().positive(),
  sellRate: z.number().positive(),
  sellDate: z.date(),
  notes: z.string().optional(),
});

const DividendSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  dividendAmount: z.number().positive(),
  dividendDate: z.date(),
  notes: z.string().optional(),
});

export interface BuyTransaction {
  id: string;
  symbol: string;
  quantity: number;
  buy_rate: number;
  total_cost: number;
  buy_date: string;
  notes: string | null;
  created_at: string;
  stock: { symbol: string };
}

export interface SellTransaction {
  id: string;
  symbol: string;
  quantity: number;
  sell_rate: number;
  total_proceeds: number;
  realized_gain_loss: number;
  sell_date: string;
  notes: string | null;
  created_at: string;
  stock: { symbol: string };
}

export interface Dividend {
  id: string;
  symbol: string;
  dividend_amount: number;
  dividend_date: string;
  notes: string | null;
  created_at: string;
  stock: { symbol: string };
}

function mapBuyTransaction(doc: { id: string; data: () => Record<string, unknown> }): BuyTransaction {
  const data = doc.data() as Omit<BuyTransaction, 'id' | 'stock'>;
  return {
    id: doc.id,
    ...data,
    buy_rate: Number(data.buy_rate),
    total_cost: Number(data.total_cost),
    stock: { symbol: data.symbol },
  };
}

function mapSellTransaction(doc: { id: string; data: () => Record<string, unknown> }): SellTransaction {
  const data = doc.data() as Omit<SellTransaction, 'id' | 'stock'>;
  return {
    id: doc.id,
    ...data,
    sell_rate: Number(data.sell_rate),
    total_proceeds: Number(data.total_proceeds),
    realized_gain_loss: Number(data.realized_gain_loss),
    stock: { symbol: data.symbol },
  };
}

function mapDividend(doc: { id: string; data: () => Record<string, unknown> }): Dividend {
  const data = doc.data() as Omit<Dividend, 'id' | 'stock'>;
  return {
    id: doc.id,
    ...data,
    dividend_amount: Number(data.dividend_amount),
    stock: { symbol: data.symbol },
  };
}

export async function addBuyTransaction(data: {
  symbol: string;
  quantity: number;
  buyRate: number;
  buyDate: Date;
  notes?: string;
}) {
  const validatedFields = BuyTransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add buy transaction.',
    };
  }

  const { symbol, quantity, buyRate, buyDate, notes } = validatedFields.data;
  const totalCost = quantity * buyRate;

  try {
    const currentBalance = await getWalletBalance();
    if (currentBalance < totalCost) {
      return { success: false, message: 'Insufficient wallet balance.' };
    }

    await addDoc(collection(db, 'stock_buy_transactions'), {
      symbol: symbol.toUpperCase(),
      quantity,
      buy_rate: buyRate,
      total_cost: totalCost,
      buy_date: buyDate.toISOString(),
      notes: notes || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully recorded buy transaction.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getBuyTransactions(): Promise<BuyTransaction[]> {
  try {
    const q = query(collection(db, 'stock_buy_transactions'), orderBy('buy_date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapBuyTransaction);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch buy transactions.');
  }
}

export async function addSellTransaction(data: {
  symbol: string;
  quantity: number;
  sellRate: number;
  sellDate: Date;
  notes?: string;
}) {
  const validatedFields = SellTransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to record sell transaction.',
    };
  }

  const { symbol: stockSymbol, quantity: sellQuantity, sellRate, sellDate, notes } = validatedFields.data;
  const symbol = stockSymbol.toUpperCase();

  try {
    const [buySnap, sellSnap] = await Promise.all([
      getDocs(query(
        collection(db, 'stock_buy_transactions'),
        where('symbol', '==', symbol),
        orderBy('buy_date', 'asc')
      )),
      getDocs(query(
        collection(db, 'stock_sell_transactions'),
        where('symbol', '==', symbol),
        orderBy('sell_date', 'asc')
      )),
    ]);

    const buyTransactions = buySnap.docs.map(d => d.data() as { quantity: number; buy_rate: number });
    const sellTransactions = sellSnap.docs.map(d => d.data() as { quantity: number });

    const totalBought = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const totalSold = sellTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const availableQuantity = totalBought - totalSold;

    if (sellQuantity > availableQuantity) {
      return {
        success: false,
        message: `Insufficient quantity. You only have ${availableQuantity} shares to sell.`,
      };
    }

    let costOfSoldShares = 0;
    let quantityToSell = sellQuantity;

    const buyLots = buyTransactions.map(tx => ({
      remaining: tx.quantity,
      buy_rate: Number(tx.buy_rate),
    }));

    for (const sellTx of sellTransactions) {
      let soldQty = sellTx.quantity;
      for (const lot of buyLots) {
        if (soldQty === 0) break;
        const consume = Math.min(lot.remaining, soldQty);
        lot.remaining -= consume;
        soldQty -= consume;
      }
    }

    for (const lot of buyLots) {
      if (quantityToSell === 0) break;
      const consume = Math.min(lot.remaining, quantityToSell);
      costOfSoldShares += consume * lot.buy_rate;
      quantityToSell -= consume;
    }

    const totalProceeds = sellQuantity * sellRate;
    const realizedGainLoss = totalProceeds - costOfSoldShares;

    await addDoc(collection(db, 'stock_sell_transactions'), {
      symbol,
      quantity: sellQuantity,
      sell_rate: sellRate,
      total_proceeds: totalProceeds,
      realized_gain_loss: realizedGainLoss,
      sell_date: sellDate.toISOString(),
      notes: notes || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully recorded sell transaction.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getSellTransactions(): Promise<SellTransaction[]> {
  try {
    const q = query(collection(db, 'stock_sell_transactions'), orderBy('sell_date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSellTransaction);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sell transactions.');
  }
}

export async function addDividend(data: {
  symbol: string;
  dividendAmount: number;
  dividendDate: Date;
  notes?: string;
}) {
  const validatedFields = DividendSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add dividend.',
    };
  }

  const { symbol, dividendAmount, dividendDate, notes } = validatedFields.data;

  try {
    await addDoc(collection(db, 'dividends'), {
      symbol: symbol.toUpperCase(),
      dividend_amount: dividendAmount,
      dividend_date: dividendDate.toISOString(),
      notes: notes || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully recorded dividend.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record dividend.' };
  }
}

export async function getDividends(): Promise<Dividend[]> {
  try {
    const q = query(collection(db, 'dividends'), orderBy('dividend_date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDividend);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch dividends.');
  }
}
