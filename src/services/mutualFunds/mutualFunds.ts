import { db } from '@/lib/firebase/client';
import { z } from 'zod';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const MutualFundSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
});

const MarketValueSchema = z.object({
  symbol: z.string().min(1).max(20),
  currentValue: z.number().nonnegative(),
});

const PurchaseSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  amount: z.number().positive('Amount must be positive'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
});

const WithdrawalSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  amount: z.number().positive('Amount must be positive'),
  withdrawalDate: z.date(),
  notes: z.string().optional(),
});

export interface MutualFund {
  symbol: string;
  name: string;
  description: string | null;
  current_market_value: number;
  created_at: string;
}

export interface MutualFundPurchase {
  id: string;
  symbol: string;
  amount: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  fund: { symbol: string; name: string } | null;
}

export interface MutualFundWithdrawal {
  id: string;
  symbol: string;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  fund: { symbol: string; name: string } | null;
}

const fundsCollection = collection(db, 'mutual_funds');
const purchasesCollection = collection(db, 'mutual_fund_purchases');
const withdrawalsCollection = collection(db, 'mutual_fund_withdrawals');

export async function addMutualFund(data: { symbol: string; name: string; description?: string }) {
  const validatedFields = MutualFundSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add mutual fund.',
    };
  }

  const { symbol, name, description } = validatedFields.data;
  const docRef = doc(db, 'mutual_funds', symbol.toUpperCase());

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      return { success: false, message: 'Mutual fund with this symbol already exists.' };
    }

    await setDoc(docRef, {
      symbol: symbol.toUpperCase(),
      name,
      description: description || null,
      current_market_value: 0,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: `Added mutual fund ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add mutual fund.' };
  }
}

export async function getMutualFunds(): Promise<MutualFund[]> {
  try {
    const q = query(fundsCollection, orderBy('symbol', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      symbol: doc.id,
      ...doc.data(),
      current_market_value: Number((doc.data() as { current_market_value: number }).current_market_value),
    })) as MutualFund[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch mutual funds.');
  }
}

export async function updateMarketValue(data: { symbol: string; currentValue: number }) {
  const validatedFields = MarketValueSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid market value data.' };
  }

  const { symbol, currentValue } = validatedFields.data;

  try {
    await updateDoc(doc(db, 'mutual_funds', symbol.toUpperCase()), {
      current_market_value: currentValue,
    });

    return { success: true, message: 'Market value updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to update market value.' };
  }
}

export async function addPurchase(data: {
  symbol: string;
  amount: number;
  purchaseDate: Date;
  notes?: string;
}) {
  const validatedFields = PurchaseSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add purchase.',
    };
  }

  const { symbol, amount, purchaseDate, notes } = validatedFields.data;

  try {
    await addDoc(purchasesCollection, {
      symbol: symbol.toUpperCase(),
      amount,
      purchase_date: purchaseDate.toISOString(),
      notes: notes || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully recorded purchase.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record purchase.' };
  }
}

export async function getPurchases(): Promise<MutualFundPurchase[]> {
  try {
    const q = query(purchasesCollection, orderBy('purchase_date', 'desc'));
    const [purchaseSnap, fundsSnap] = await Promise.all([getDocs(q), getDocs(fundsCollection)]);

    const fundMap = new Map<string, string>();
    fundsSnap.docs.forEach(f => {
      const data = f.data() as { name: string };
      fundMap.set(f.id, data.name);
    });

    return purchaseSnap.docs.map(p => {
      const data = p.data() as Omit<MutualFundPurchase, 'id' | 'fund'>;
      const s = data.symbol;
      return {
        id: p.id,
        ...data,
        amount: Number(data.amount),
        fund: { symbol: s, name: fundMap.get(s) || s },
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch purchases.');
  }
}

export async function addWithdrawal(data: {
  symbol: string;
  amount: number;
  withdrawalDate: Date;
  notes?: string;
}) {
  const validatedFields = WithdrawalSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add withdrawal.',
    };
  }

  const { symbol, amount, withdrawalDate, notes } = validatedFields.data;

  try {
    await addDoc(withdrawalsCollection, {
      symbol: symbol.toUpperCase(),
      amount,
      withdrawal_date: withdrawalDate.toISOString(),
      notes: notes || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully recorded withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record withdrawal.' };
  }
}

export async function getWithdrawals(): Promise<MutualFundWithdrawal[]> {
  try {
    const q = query(withdrawalsCollection, orderBy('withdrawal_date', 'desc'));
    const [withdrawalSnap, fundsSnap] = await Promise.all([getDocs(q), getDocs(fundsCollection)]);

    const fundMap = new Map<string, string>();
    fundsSnap.docs.forEach(f => {
      const data = f.data() as { name: string };
      fundMap.set(f.id, data.name);
    });

    return withdrawalSnap.docs.map(w => {
      const data = w.data() as Omit<MutualFundWithdrawal, 'id' | 'fund'>;
      const s = data.symbol;
      return {
        id: w.id,
        ...data,
        amount: Number(data.amount),
        fund: { symbol: s, name: fundMap.get(s) || s },
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}

export interface FundMetrics {
  symbol: string;
  name: string;
  totalPurchases: number;
  totalWithdrawals: number;
  netInvestment: number;
  currentMarketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

async function getFundMetrics(symbol: string): Promise<FundMetrics | null> {
  try {
    const fundSnap = await getDoc(doc(db, 'mutual_funds', symbol));
    if (!fundSnap.exists()) return null;
    const fund = fundSnap.data() as MutualFund;

    const [purchasesSnap, withdrawalsSnap] = await Promise.all([
      getDocs(query(purchasesCollection, where('symbol', '==', symbol))),
      getDocs(query(withdrawalsCollection, where('symbol', '==', symbol))),
    ]);

    const totalPurchases = purchasesSnap.docs.reduce((sum, p) => sum + Number((p.data() as { amount: number }).amount), 0);
    const totalWithdrawals = withdrawalsSnap.docs.reduce((sum, w) => sum + Number((w.data() as { amount: number }).amount), 0);
    const netInvestment = totalPurchases - totalWithdrawals;
    const currentMarketValue = Number(fund.current_market_value);
    const gainLoss = currentMarketValue - netInvestment;
    const gainLossPercent = netInvestment > 0 ? (gainLoss / netInvestment) * 100 : 0;

    return {
      symbol: fund.symbol,
      name: fund.name,
      totalPurchases,
      totalWithdrawals,
      netInvestment,
      currentMarketValue,
      gainLoss,
      gainLossPercent,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to calculate fund metrics.');
  }
}

export async function getAllFundMetrics(): Promise<FundMetrics[]> {
  try {
    const funds = await getMutualFunds();
    const metrics = await Promise.all(funds.map(f => getFundMetrics(f.symbol)));
    return metrics.filter((m): m is FundMetrics => m !== null);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all fund metrics.');
  }
}
