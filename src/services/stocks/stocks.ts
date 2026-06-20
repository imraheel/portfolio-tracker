import { db } from '@/lib/firebase/client';
import { z } from 'zod';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const StockSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  companyName: z.string().optional(),
  sector: z.string().optional(),
});

const PriceUpdateSchema = z.object({
  symbol: z.string().min(1).max(10),
  currentPrice: z.number().nonnegative(),
});

export interface Stock {
  symbol: string;
  company_name: string | null;
  sector: string | null;
  created_at: string;
}

export interface StockPrice {
  symbol: string;
  current_price: number;
  updated_at: string;
}

export async function addStock(data: { symbol: string; companyName?: string; sector?: string }) {
  const validatedFields = StockSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add stock.',
    };
  }

  const { symbol, companyName, sector } = validatedFields.data;
  const docRef = doc(db, 'stocks', symbol.toUpperCase());

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      return { success: false, message: 'Stock with this symbol already exists.' };
    }

    await setDoc(docRef, {
      symbol: symbol.toUpperCase(),
      company_name: companyName || null,
      sector: sector || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: `Added stock ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add stock.' };
  }
}

export async function getStocks(): Promise<Stock[]> {
  try {
    const q = query(collection(db, 'stocks'), orderBy('symbol', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      symbol: doc.id,
      ...doc.data(),
    })) as Stock[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stocks.');
  }
}

export async function updateStockPrice(data: { symbol: string; currentPrice: number }) {
  const validatedFields = PriceUpdateSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid price data.' };
  }

  const { symbol, currentPrice } = validatedFields.data;
  const docRef = doc(db, 'stock_prices', symbol.toUpperCase());

  try {
    await setDoc(docRef, {
      symbol: symbol.toUpperCase(),
      current_price: currentPrice,
      updated_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Price updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to update price.' };
  }
}

export async function getStockPrices(): Promise<StockPrice[]> {
  try {
    const snapshot = await getDocs(collection(db, 'stock_prices'));
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      symbol: doc.id,
      current_price: Number((doc.data() as StockPrice).current_price),
    })) as StockPrice[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stock prices.');
  }
}
