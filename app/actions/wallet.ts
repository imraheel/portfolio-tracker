'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const DepositSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  depositDate: z.coerce.date(),
  note: z.string().optional(),
});

export async function addDeposit(prevState: unknown, formData: FormData) {
  const validatedFields = DepositSchema.safeParse({
    amount: formData.get('amount'),
    depositDate: formData.get('depositDate'),
    note: formData.get('note'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add deposit. Please check the fields.',
    };
  }

  const { amount, depositDate, note } = validatedFields.data;

  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('deposits')
      .insert({
        amount,
        deposit_date: depositDate.toISOString(),
        note,
      });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/wallet');
    return { message: 'Successfully added deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to add deposit.' };
  }
}

export async function deleteDeposit(prevState: unknown, formData: FormData) {
  const id = Number(formData.get('id'));

  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('deposits')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/wallet');
    return { message: 'Deleted deposit.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to delete deposit.' };
  }
}

export async function getDeposits() {
  try {
    const supabase = await createClient();
    
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

export async function getWalletBalance() {
  try {
    const supabase = await createClient();

    // Get total deposits
    const { data: depositsData } = await supabase
      .from('deposits')
      .select('amount');
    
    const totalDeposits = (depositsData || []).reduce((sum, d) => sum + Number(d.amount), 0);

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

    const balance = totalDeposits - totalBuys + totalSells + totalDividends;
    
    return balance;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch wallet balance.');
  }
}
