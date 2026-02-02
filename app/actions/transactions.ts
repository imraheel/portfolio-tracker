'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getWalletBalance } from './wallet';

const BuyTransactionSchema = z.object({
  stockId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  buyRate: z.coerce.number().positive(),
  buyDate: z.coerce.date(),
  notes: z.string().optional(),
});

export async function addBuyTransaction(prevState: unknown, formData: FormData) {
  const validatedFields = BuyTransactionSchema.safeParse({
    stockId: formData.get('stockId'),
    quantity: formData.get('quantity'),
    buyRate: formData.get('buyRate'),
    buyDate: formData.get('buyDate'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add buy transaction.',
    };
  }

  const { stockId, quantity, buyRate, buyDate, notes } = validatedFields.data;
  const totalCost = quantity * buyRate;

  try {
    // Validation: Check Wallet Balance
    const currentBalance = await getWalletBalance();
    if (currentBalance < totalCost) {
      return { message: 'Insufficient wallet balance.' };
    }

    // Create Transaction
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('stock_buy_transactions')
      .insert({
        stock_id: stockId,
        quantity,
        buy_rate: buyRate,
        total_cost: totalCost,
        buy_date: buyDate.toISOString(),
        notes,
      });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/transactions');
    return { message: 'Successfully recorded buy transaction.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getBuyTransactions() {
  try {
    const supabase = await createClient();
    
    const { data: transactions, error } = await supabase
      .from('stock_buy_transactions')
      .select(`
        *,
        stocks (symbol)
      `)
      .order('buy_date', { ascending: false });

    if (error) throw error;

    // Transform the data to match the expected format
    return (transactions || []).map(tx => ({
      ...tx,
      stock: { symbol: tx.stocks?.symbol },
      buyRate: Number(tx.buy_rate),
      totalCost: Number(tx.total_cost),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch buy transactions.');
  }
}

const SellTransactionSchema = z.object({
  stockId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  sellRate: z.coerce.number().positive(),
  sellDate: z.coerce.date(),
  notes: z.string().optional(),
});

export async function addSellTransaction(prevState: unknown, formData: FormData) {
  const validatedFields = SellTransactionSchema.safeParse({
    stockId: formData.get('stockId'),
    quantity: formData.get('quantity'),
    sellRate: formData.get('sellRate'),
    sellDate: formData.get('sellDate'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to record sell transaction.',
    };
  }

  const { stockId, quantity: sellQuantity, sellRate, sellDate, notes } = validatedFields.data;

  try {
    const supabase = await createClient();

    // Get all buy transactions for this stock
    const { data: buyTransactions, error: buyError } = await supabase
      .from('stock_buy_transactions')
      .select('*')
      .eq('stock_id', stockId)
      .order('buy_date', { ascending: true });

    if (buyError) throw buyError;

    // Get all sell transactions for this stock
    const { data: sellTransactions, error: sellError } = await supabase
      .from('stock_sell_transactions')
      .select('*')
      .eq('stock_id', stockId)
      .order('sell_date', { ascending: true });

    if (sellError) throw sellError;

    const totalBought = (buyTransactions || []).reduce((sum, tx) => sum + tx.quantity, 0);
    const totalSold = (sellTransactions || []).reduce((sum, tx) => sum + tx.quantity, 0);
    const availableQuantity = totalBought - totalSold;

    if (sellQuantity > availableQuantity) {
      return { message: `Insufficient quantity. You only have ${availableQuantity} shares to sell.` };
    }

    // FIFO Calculation
    let costOfSoldShares = 0;
    let quantityToSell = sellQuantity;
    
    // Create a mutable copy of buys with remaining quantities
    const buyLots = (buyTransactions || []).map(tx => ({ 
      ...tx, 
      remaining: tx.quantity,
      buyRate: Number(tx.buy_rate)
    }));

    // First, account for previous sells
    for (const sellTx of (sellTransactions || [])) {
      let soldQty = sellTx.quantity;
      for (const lot of buyLots) {
        if (soldQty === 0) break;
        const consume = Math.min(lot.remaining, soldQty);
        lot.remaining -= consume;
        soldQty -= consume;
      }
    }

    // Now, calculate cost for the current sell from remaining lots
    for (const lot of buyLots) {
      if (quantityToSell === 0) break;
      const consume = Math.min(lot.remaining, quantityToSell);
      costOfSoldShares += consume * lot.buyRate;
      quantityToSell -= consume;
    }

    const totalProceeds = sellQuantity * sellRate;
    const realizedGainLoss = totalProceeds - costOfSoldShares;

    // Insert sell transaction
    const { error: insertError } = await supabase
      .from('stock_sell_transactions')
      .insert({
        stock_id: stockId,
        quantity: sellQuantity,
        sell_rate: sellRate,
        total_proceeds: totalProceeds,
        realized_gain_loss: realizedGainLoss,
        sell_date: sellDate.toISOString(),
        notes,
      });

    if (insertError) throw insertError;

    revalidatePath('/');
    revalidatePath('/transactions');
    return { message: 'Successfully recorded sell transaction.' };

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getSellTransactions() {
  try {
    const supabase = await createClient();
    
    const { data: transactions, error } = await supabase
      .from('stock_sell_transactions')
      .select(`
        *,
        stocks (symbol)
      `)
      .order('sell_date', { ascending: false });

    if (error) throw error;

    // Transform the data to match the expected format
    return (transactions || []).map(tx => ({
      ...tx,
      stock: { symbol: tx.stocks?.symbol },
      sellRate: Number(tx.sell_rate),
      totalProceeds: Number(tx.total_proceeds),
      realizedGainLoss: Number(tx.realized_gain_loss),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sell transactions.');
  }
}

// --- DIVIDEND ACTIONS ---

const DividendSchema = z.object({
  stockId: z.coerce.number().int().positive(),
  dividendAmount: z.coerce.number().positive(),
  dividendDate: z.coerce.date(),
  notes: z.string().optional(),
});

export async function addDividend(prevState: unknown, formData: FormData) {
  const validatedFields = DividendSchema.safeParse({
    stockId: formData.get('stockId'),
    dividendAmount: formData.get('dividendAmount'),
    dividendDate: formData.get('dividendDate'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add dividend.',
    };
  }

  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('dividends')
      .insert({
        stock_id: validatedFields.data.stockId,
        dividend_amount: validatedFields.data.dividendAmount,
        dividend_date: validatedFields.data.dividendDate.toISOString(),
        notes: validatedFields.data.notes,
      });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/transactions');
    return { message: 'Successfully recorded dividend.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to record dividend.' };
  }
}

export async function getDividends() {
  try {
    const supabase = await createClient();
    
    const { data: dividends, error } = await supabase
      .from('dividends')
      .select(`
        *,
        stocks (symbol)
      `)
      .order('dividend_date', { ascending: false });

    if (error) throw error;

    // Transform the data to match the expected format
    return (dividends || []).map(d => ({
      ...d,
      stock: { symbol: d.stocks?.symbol },
      dividendAmount: Number(d.dividend_amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch dividends.');
  }
}
