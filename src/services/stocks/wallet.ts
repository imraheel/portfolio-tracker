import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

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
  id: number;
  amount: number;
  deposit_date: string;
  note: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: number;
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
    const { error } = await supabase
      .from('deposits')
      .insert({
        amount,
        deposit_date: depositDate.toISOString(),
        note,
      });

    if (error) throw error;

    return { success: true, message: 'Successfully added deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add deposit.' };
  }
}

export async function deleteDeposit(id: number) {
  try {
    const { error } = await supabase
      .from('deposits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Deleted deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to delete deposit.' };
  }
}

export async function getDeposits(): Promise<Deposit[]> {
  try {
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('*')
      .order('deposit_date', { ascending: false });

    if (error) throw error;

    // Transform decimal amounts to numbers
    return (deposits || []).map(d => ({
      ...d,
      amount: Number(d.amount),
    }));
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

  // Check if sufficient balance exists
  try {
    const currentBalance = await getWalletBalance();
    if (amount > currentBalance) {
      return {
        success: false,
        message: `Insufficient wallet balance. Available: Rs. ${currentBalance.toLocaleString('en-PK')}`,
      };
    }

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        amount,
        withdrawal_date: withdrawalDate.toISOString(),
        note,
      });

    if (error) throw error;

    return { success: true, message: 'Successfully added withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add withdrawal.' };
  }
}

export async function deleteWithdrawal(id: number) {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, message: 'Deleted withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to delete withdrawal.' };
  }
}

export async function getWithdrawals(): Promise<Withdrawal[]> {
  try {
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('withdrawal_date', { ascending: false });

    if (error) throw error;

    // Transform decimal amounts to numbers
    return (withdrawals || []).map(w => ({
      ...w,
      amount: Number(w.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}

export async function getWalletBalance(): Promise<number> {
  try {
    // Get total deposits
    const { data: depositsData } = await supabase
      .from('deposits')
      .select('amount');
    
    const totalDeposits = (depositsData || []).reduce((sum, d) => sum + Number(d.amount), 0);

    // Get total withdrawals
    const { data: withdrawalsData } = await supabase
      .from('withdrawals')
      .select('amount');
    
    const totalWithdrawals = (withdrawalsData || []).reduce((sum, w) => sum + Number(w.amount), 0);

    // Get total buy costs
    const { data: buysData } = await supabase
      .from('stock_buy_transactions')
      .select('total_cost');
    
    const totalBuys = (buysData || []).reduce((sum, t) => sum + Number(t.total_cost), 0);

    // Get total sell proceeds
    const { data: sellsData } = await supabase
      .from('stock_sell_transactions')
      .select('total_proceeds');
    
    const totalSells = (sellsData || []).reduce((sum, t) => sum + Number(t.total_proceeds), 0);

    // Get total dividends
    const { data: dividendsData } = await supabase
      .from('dividends')
      .select('dividend_amount');
    
    const totalDividends = (dividendsData || []).reduce((sum, d) => sum + Number(d.dividend_amount), 0);

    // Calculate balance: Deposits - Withdrawals - Buys + Sells + Dividends
    const balance = totalDeposits - totalWithdrawals - totalBuys + totalSells + totalDividends;
    
    return balance;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch wallet balance.');
  }
}
