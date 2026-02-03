import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

const CryptocurrencySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  name: z.string().min(1, 'Name is required').max(255),
});

const TotalValueSchema = z.object({
  cryptoId: z.number().int().positive(),
  totalValue: z.number().nonnegative(),
});

const PurchaseSchema = z.object({
  cryptoId: z.number().int().positive(),
  amountPkr: z.number().positive('Amount must be positive'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
});

const WithdrawalSchema = z.object({
  cryptoId: z.number().int().positive(),
  amountPkr: z.number().positive('Amount must be positive'),
  withdrawalDate: z.date(),
  notes: z.string().optional(),
});

export interface Cryptocurrency {
  id: number;
  symbol: string;
  name: string;
  current_total_value: number;
  created_at: string;
}

export interface CryptoPurchase {
  id: number;
  crypto_id: number;
  amount_pkr: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency: { symbol: string; name: string } | null;
}

export interface CryptoWithdrawal {
  id: number;
  crypto_id: number;
  amount_pkr: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
  cryptocurrency: { symbol: string; name: string } | null;
}

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

  try {
    const { data: existingCrypto } = await supabase
      .from('cryptocurrencies')
      .select('id')
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    if (existingCrypto) {
      return { success: false, message: 'Cryptocurrency with this symbol already exists.' };
    }

    const { error } = await supabase.from('cryptocurrencies').insert({
      symbol: symbol.toUpperCase(),
      name,
      current_total_value: 0,
    });

    if (error) throw error;

    return { success: true, message: `Added cryptocurrency ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add cryptocurrency.' };
  }
}

export async function getCryptocurrencies(): Promise<Cryptocurrency[]> {
  try {
    const { data: cryptos, error } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .order('symbol', { ascending: true });

    if (error) throw error;

    return (cryptos || []).map((c) => ({
      ...c,
      current_total_value: Number(c.current_total_value),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch cryptocurrencies.');
  }
}

export async function updateTotalValue(data: { cryptoId: number; totalValue: number }) {
  const validatedFields = TotalValueSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid total value data.' };
  }

  const { cryptoId, totalValue } = validatedFields.data;

  try {
    const { error } = await supabase
      .from('cryptocurrencies')
      .update({ current_total_value: totalValue })
      .eq('id', cryptoId);

    if (error) throw error;

    return { success: true, message: 'Total value updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to update total value.' };
  }
}

export async function addPurchase(data: {
  cryptoId: number;
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

  const { cryptoId, amountPkr, purchaseDate, notes } = validatedFields.data;

  try {
    const { error } = await supabase.from('crypto_purchases').insert({
      crypto_id: cryptoId,
      amount_pkr: amountPkr,
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

export async function getPurchases(): Promise<CryptoPurchase[]> {
  try {
    const { data: purchases, error } = await supabase
      .from('crypto_purchases')
      .select(`
        *,
        cryptocurrencies (symbol, name)
      `)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    return (purchases || []).map((p) => ({
      ...p,
      cryptocurrency: p.cryptocurrencies,
      amount_pkr: Number(p.amount_pkr),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch purchases.');
  }
}

export async function addWithdrawal(data: {
  cryptoId: number;
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

  const { cryptoId, amountPkr, withdrawalDate, notes } = validatedFields.data;

  try {
    const { error } = await supabase.from('crypto_withdrawals').insert({
      crypto_id: cryptoId,
      amount_pkr: amountPkr,
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

export async function getWithdrawals(): Promise<CryptoWithdrawal[]> {
  try {
    const { data: withdrawals, error } = await supabase
      .from('crypto_withdrawals')
      .select(`
        *,
        cryptocurrencies (symbol, name)
      `)
      .order('withdrawal_date', { ascending: false });

    if (error) throw error;

    return (withdrawals || []).map((w) => ({
      ...w,
      cryptocurrency: w.cryptocurrencies,
      amount_pkr: Number(w.amount_pkr),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch withdrawals.');
  }
}

export interface CryptoMetrics {
  cryptoId: number;
  symbol: string;
  name: string;
  totalPurchases: number;
  totalWithdrawals: number;
  netInvestment: number;
  currentTotalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export async function getCryptoMetrics(cryptoId: number): Promise<CryptoMetrics | null> {
  try {
    const { data: crypto, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .eq('id', cryptoId)
      .single();

    if (cryptoError || !crypto) return null;

    const { data: purchases, error: purchasesError } = await supabase
      .from('crypto_purchases')
      .select('amount_pkr')
      .eq('crypto_id', cryptoId);

    if (purchasesError) throw purchasesError;

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('crypto_withdrawals')
      .select('amount_pkr')
      .eq('crypto_id', cryptoId);

    if (withdrawalsError) throw withdrawalsError;

    const totalPurchases = (purchases || []).reduce((sum, p) => sum + Number(p.amount_pkr), 0);
    const totalWithdrawals = (withdrawals || []).reduce((sum, w) => sum + Number(w.amount_pkr), 0);
    const netInvestment = totalPurchases - totalWithdrawals;
    const currentTotalValue = Number(crypto.current_total_value);
    const gainLoss = currentTotalValue - netInvestment;
    const gainLossPercent = netInvestment > 0 ? (gainLoss / netInvestment) * 100 : 0;

    return {
      cryptoId: crypto.id,
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
    const metrics = await Promise.all(cryptos.map((c) => getCryptoMetrics(c.id)));
    return metrics.filter((m): m is CryptoMetrics => m !== null);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all crypto metrics.');
  }
}
