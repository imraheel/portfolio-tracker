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

const CryptocurrencySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  name: z.string().min(1, 'Name is required').max(255),
});

const TotalValueSchema = z.object({
  symbol: z.string().min(1).max(20),
  totalValue: z.number().nonnegative(),
});

const PurchaseSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  amountPkr: z.number().positive('Amount must be positive'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
});

const WithdrawalSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  amountPkr: z.number().positive('Amount must be positive'),
  withdrawalDate: z.date(),
  notes: z.string().optional(),
});

export interface Cryptocurrency {
  symbol: string;
  name: string;
  current_total_value: number;
  created_at: string;
}

export interface CryptoPurchase {
  id: string;
  symbol: string;
  amount_pkr: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency: { symbol: string; name: string } | null;
}

export interface CryptoWithdrawal {
  id: string;
  symbol: string;
  amount_pkr: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency: { symbol: string; name: string } | null;
}

const cryptosCollection = collection(db, 'cryptocurrencies');
const purchasesCollection = collection(db, 'crypto_purchases');
const withdrawalsCollection = collection(db, 'crypto_withdrawals');

export async function addCryptocurrency(data: { symbol: string; name: string }) {
  const validatedFields = CryptocurrencySchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add cryptocurrency.',
    };
  }

  const { symbol, name } = validatedFields.data;
  const docRef = doc(db, 'cryptocurrencies', symbol.toUpperCase());

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      return { success: false, message: 'Cryptocurrency with this symbol already exists.' };
    }

    await setDoc(docRef, {
      symbol: symbol.toUpperCase(),
      name,
      current_total_value: 0,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: `Added cryptocurrency ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add cryptocurrency.' };
  }
}

export async function getCryptocurrencies(): Promise<Cryptocurrency[]> {
  try {
    const q = query(cryptosCollection, orderBy('symbol', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      symbol: doc.id,
      ...doc.data(),
      current_total_value: Number((doc.data() as { current_total_value: number }).current_total_value),
    })) as Cryptocurrency[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch cryptocurrencies.');
  }
}

export async function updateTotalValue(data: { symbol: string; totalValue: number }) {
  const validatedFields = TotalValueSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid total value data.' };
  }

  const { symbol, totalValue } = validatedFields.data;

  try {
    await updateDoc(doc(db, 'cryptocurrencies', symbol.toUpperCase()), {
      current_total_value: totalValue,
    });

    return { success: true, message: 'Total value updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to update total value.' };
  }
}

export async function addPurchase(data: {
  symbol: string;
  amountPkr: number;
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

  const { symbol, amountPkr, purchaseDate, notes } = validatedFields.data;

  try {
    await addDoc(purchasesCollection, {
      symbol: symbol.toUpperCase(),
      amount_pkr: amountPkr,
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

export async function getPurchases(): Promise<CryptoPurchase[]> {
  try {
    const q = query(purchasesCollection, orderBy('purchase_date', 'desc'));
    const [purchaseSnap, cryptosSnap] = await Promise.all([getDocs(q), getDocs(cryptosCollection)]);

    const cryptoMap = new Map<string, string>();
    cryptosSnap.docs.forEach(c => {
      const data = c.data() as { name: string };
      cryptoMap.set(c.id, data.name);
    });

    return purchaseSnap.docs.map(p => {
      const data = p.data() as Omit<CryptoPurchase, 'id' | 'cryptocurrency'>;
      const s = data.symbol;
      return {
        id: p.id,
        ...data,
        amount_pkr: Number(data.amount_pkr),
        cryptocurrency: { symbol: s, name: cryptoMap.get(s) || s },
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch purchases.');
  }
}

export async function addWithdrawal(data: {
  symbol: string;
  amountPkr: number;
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

  const { symbol, amountPkr, withdrawalDate, notes } = validatedFields.data;

  try {
    await addDoc(withdrawalsCollection, {
      symbol: symbol.toUpperCase(),
      amount_pkr: amountPkr,
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

export async function getWithdrawals(): Promise<CryptoWithdrawal[]> {
  try {
    const q = query(withdrawalsCollection, orderBy('withdrawal_date', 'desc'));
    const [withdrawalSnap, cryptosSnap] = await Promise.all([getDocs(q), getDocs(cryptosCollection)]);

    const cryptoMap = new Map<string, string>();
    cryptosSnap.docs.forEach(c => {
      const data = c.data() as { name: string };
      cryptoMap.set(c.id, data.name);
    });

    return withdrawalSnap.docs.map(w => {
      const data = w.data() as Omit<CryptoWithdrawal, 'id' | 'cryptocurrency'>;
      const s = data.symbol;
      return {
        id: w.id,
        ...data,
        amount_pkr: Number(data.amount_pkr),
        cryptocurrency: { symbol: s, name: cryptoMap.get(s) || s },
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}

export interface CryptoMetrics {
  symbol: string;
  name: string;
  totalPurchases: number;
  totalWithdrawals: number;
  netInvestment: number;
  currentTotalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

async function getCryptoMetrics(symbol: string): Promise<CryptoMetrics | null> {
  try {
    const cryptoSnap = await getDoc(doc(db, 'cryptocurrencies', symbol));
    if (!cryptoSnap.exists()) return null;
    const crypto = cryptoSnap.data() as Cryptocurrency;

    const [purchasesSnap, withdrawalsSnap] = await Promise.all([
      getDocs(query(purchasesCollection, where('symbol', '==', symbol))),
      getDocs(query(withdrawalsCollection, where('symbol', '==', symbol))),
    ]);

    const totalPurchases = purchasesSnap.docs.reduce((sum, p) => sum + Number((p.data() as { amount_pkr: number }).amount_pkr), 0);
    const totalWithdrawals = withdrawalsSnap.docs.reduce((sum, w) => sum + Number((w.data() as { amount_pkr: number }).amount_pkr), 0);
    const netInvestment = totalPurchases - totalWithdrawals;
    const currentTotalValue = Number(crypto.current_total_value);
    const gainLoss = currentTotalValue - netInvestment;
    const gainLossPercent = netInvestment > 0 ? (gainLoss / netInvestment) * 100 : 0;

    return {
      symbol: crypto.symbol,
      name: crypto.name,
      totalPurchases,
      totalWithdrawals,
      netInvestment,
      currentTotalValue,
      gainLoss,
      gainLossPercent,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to calculate crypto metrics.');
  }
}

export async function getAllCryptoMetrics(): Promise<CryptoMetrics[]> {
  try {
    const cryptos = await getCryptocurrencies();
    const metrics = await Promise.all(cryptos.map(c => getCryptoMetrics(c.symbol)));
    return metrics.filter((m): m is CryptoMetrics => m !== null);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all crypto metrics.');
  }
}
