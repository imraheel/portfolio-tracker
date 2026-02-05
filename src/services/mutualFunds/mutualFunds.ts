import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

const MutualFundSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
});

const MarketValueSchema = z.object({
  fundId: z.number().int().positive(),
  currentValue: z.number().nonnegative(),
});

const PurchaseSchema = z.object({
  fundId: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
});

const WithdrawalSchema = z.object({
  fundId: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
  withdrawalDate: z.date(),
  notes: z.string().optional(),
});

export interface MutualFund {
  id: number;
  symbol: string;
  name: string;
  description: string | null;
  current_market_value: number;
  created_at: string;
}

export interface MutualFundPurchase {
  id: number;
  fund_id: number;
  amount: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  fund: { symbol: string; name: string } | null;
}

export interface MutualFundWithdrawal {
  id: number;
  fund_id: number;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  fund: { symbol: string; name: string } | null;
}

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

  try {
    const { data: existingFund } = await supabase
      .from('mutual_funds')
      .select('id')
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    if (existingFund) {
      return { success: false, message: 'Mutual fund with this symbol already exists.' };
    }

    const { error } = await supabase.from('mutual_funds').insert({
      symbol: symbol.toUpperCase(),
      name,
      description,
      current_market_value: 0,
    });

    if (error) throw error;

    return { success: true, message: `Added mutual fund ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add mutual fund.' };
  }
}

export async function getMutualFunds(): Promise<MutualFund[]> {
  try {
    const { data: funds, error } = await supabase
      .from('mutual_funds')
      .select('*')
      .order('symbol', { ascending: true });

    if (error) throw error;

    return (funds || []).map((f) => ({
      ...f,
      current_market_value: Number(f.current_market_value),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch mutual funds.');
  }
}

export async function updateMarketValue(data: { fundId: number; currentValue: number }) {
  const validatedFields = MarketValueSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid market value data.' };
  }

  const { fundId, currentValue } = validatedFields.data;

  try {
    const { error } = await supabase
      .from('mutual_funds')
      .update({ current_market_value: currentValue })
      .eq('id', fundId);

    if (error) throw error;

    return { success: true, message: 'Market value updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to update market value.' };
  }
}

export async function addPurchase(data: {
  fundId: number;
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

  const { fundId, amount, purchaseDate, notes } = validatedFields.data;

  try {
    const { error } = await supabase.from('mutual_fund_purchases').insert({
      fund_id: fundId,
      amount,
      purchase_date: purchaseDate.toISOString(),
      notes,
    });

    if (error) throw error;

    return { success: true, message: 'Successfully recorded purchase.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record purchase.' };
  }
}

export async function getPurchases(): Promise<MutualFundPurchase[]> {
  try {
    const { data: purchases, error } = await supabase
      .from('mutual_fund_purchases')
      .select(`
        *,
        mutual_funds (symbol, name)
      `)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    return (purchases || []).map((p) => ({
      ...p,
      fund: p.mutual_funds,
      amount: Number(p.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch purchases.');
  }
}

export async function addWithdrawal(data: {
  fundId: number;
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

  const { fundId, amount, withdrawalDate, notes } = validatedFields.data;

  try {
    const { error } = await supabase.from('mutual_fund_withdrawals').insert({
      fund_id: fundId,
      amount,
      withdrawal_date: withdrawalDate.toISOString(),
      notes,
    });

    if (error) throw error;

    return { success: true, message: 'Successfully recorded withdrawal.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record withdrawal.' };
  }
}

export async function getWithdrawals(): Promise<MutualFundWithdrawal[]> {
  try {
    const { data: withdrawals, error } = await supabase
      .from('mutual_fund_withdrawals')
      .select(`
        *,
        mutual_funds (symbol, name)
      `)
      .order('withdrawal_date', { ascending: false });

    if (error) throw error;

    return (withdrawals || []).map((w) => ({
      ...w,
      fund: w.mutual_funds,
      amount: Number(w.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}

export interface FundMetrics {
  fundId: number;
  symbol: string;
  name: string;
  totalPurchases: number;
  totalWithdrawals: number;
  netInvestment: number;
  currentMarketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

async function getFundMetrics(fundId: number): Promise<FundMetrics | null> {
  try {
    const { data: fund, error: fundError } = await supabase
      .from('mutual_funds')
      .select('*')
      .eq('id', fundId)
      .single();

    if (fundError || !fund) return null;

    const { data: purchases, error: purchasesError } = await supabase
      .from('mutual_fund_purchases')
      .select('amount')
      .eq('fund_id', fundId);

    if (purchasesError) throw purchasesError;

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('mutual_fund_withdrawals')
      .select('amount')
      .eq('fund_id', fundId);

    if (withdrawalsError) throw withdrawalsError;

    const totalPurchases = (purchases || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const totalWithdrawals = (withdrawals || []).reduce((sum, w) => sum + Number(w.amount), 0);
    const netInvestment = totalPurchases - totalWithdrawals;
    const currentMarketValue = Number(fund.current_market_value);
    const gainLoss = currentMarketValue - netInvestment;
    const gainLossPercent = netInvestment > 0 ? (gainLoss / netInvestment) * 100 : 0;

    return {
      fundId: fund.id,
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
    const metrics = await Promise.all(funds.map((f) => getFundMetrics(f.id)));
    return metrics.filter((m): m is FundMetrics => m !== null);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all fund metrics.');
  }
}
