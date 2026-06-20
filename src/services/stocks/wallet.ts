import { db } from '@/lib/firebase/client';
import { z } from 'zod';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const DepositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  depositDate: z.date(),
  note: z.string().optional(),
});

const WithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  withdrawalDate: z.date(),
  note: z.string().optional(),
});

export interface Deposit {
  id: string;
  amount: number;
  deposit_date: string;
  note: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  withdrawal_date: string;
  note: string | null;
  created_at: string;
}

export async function addDeposit(data: { amount: number; depositDate: Date; note?: string }) {
  const validatedFields = DepositSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add deposit. Please check the fields.',
    };
  }

  const { amount, depositDate, note } = validatedFields.data;

  try {
    await addDoc(collection(db, 'deposits'), {
      amount,
      deposit_date: depositDate.toISOString(),
      note: note || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully added deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add deposit.' };
  }
}

export async function deleteDeposit(id: string) {
  try {
    await deleteDoc(doc(db, 'deposits', id));
    return { success: true, message: 'Deleted deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to delete deposit.' };
  }
}

export async function getDeposits(): Promise<Deposit[]> {
  try {
    const q = query(collection(db, 'deposits'), orderBy('deposit_date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      amount: Number((d.data() as { amount: number }).amount),
    })) as Deposit[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch deposits.');
  }
}

export async function addWithdrawal(data: { amount: number; withdrawalDate: Date; note?: string }) {
  const validatedFields = WithdrawalSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add withdrawal. Please check the fields.',
    };
  }

  const { amount, withdrawalDate, note } = validatedFields.data;

  try {
    const currentBalance = await getWalletBalance();
    if (amount > currentBalance) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available: Rs. ${currentBalance.toLocaleString('en-PK')}`,
      };
    }

    await addDoc(collection(db, 'withdrawals'), {
      amount,
      withdrawal_date: withdrawalDate.toISOString(),
      note: note || null,
      created_at: Timestamp.now().toDate().toISOString(),
    });

    return { success: true, message: 'Successfully added withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add withdrawal.' };
  }
}

export async function deleteWithdrawal(id: string) {
  try {
    await deleteDoc(doc(db, 'withdrawals', id));
    return { success: true, message: 'Deleted withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to delete withdrawal.' };
  }
}

export async function getWithdrawals(): Promise<Withdrawal[]> {
  try {
    const q = query(collection(db, 'withdrawals'), orderBy('withdrawal_date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(w => ({
      id: w.id,
      ...w.data(),
      amount: Number((w.data() as { amount: number }).amount),
    })) as Withdrawal[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}

export async function getWalletBalance(): Promise<number> {
  try {
    const [depositsSnap, withdrawalsSnap, buysSnap, sellsSnap, dividendsSnap] = await Promise.all([
      getDocs(collection(db, 'deposits')),
      getDocs(collection(db, 'withdrawals')),
      getDocs(collection(db, 'stock_buy_transactions')),
      getDocs(collection(db, 'stock_sell_transactions')),
      getDocs(collection(db, 'dividends')),
    ]);

    const totalDeposits = depositsSnap.docs.reduce((sum, d) => sum + Number((d.data() as { amount: number }).amount), 0);
    const totalWithdrawals = withdrawalsSnap.docs.reduce((sum, w) => sum + Number((w.data() as { amount: number }).amount), 0);
    const totalBuys = buysSnap.docs.reduce((sum, t) => sum + Number((t.data() as { total_cost: number }).total_cost), 0);
    const totalSells = sellsSnap.docs.reduce((sum, t) => sum + Number((t.data() as { total_proceeds: number }).total_proceeds), 0);
    const totalDividends = dividendsSnap.docs.reduce((sum, d) => sum + Number((d.data() as { dividend_amount: number }).dividend_amount), 0);

    return totalDeposits - totalWithdrawals - totalBuys + totalSells + totalDividends;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch wallet balance.');
  }
}
