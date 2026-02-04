import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';
import { getWalletBalance } from './wallet';

const BuyTransactionSchema = z.object({
  stockId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  buyRate: z.number().positive(),
  buyDate: z.date(),
  notes: z.string().optional(),
});

const SellTransactionSchema = z.object({
  stockId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  sellRate: z.number().positive(),
  sellDate: z.date(),
  notes: z.string().optional(),
});

const DividendSchema = z.object({
  stockId: z.number().int().positive(),
  dividendAmount: z.number().positive(),
  dividendDate: z.date(),
  notes: z.string().optional(),
});

export interface BuyTransaction {
  id: number;
  stock_id: number;
  quantity: number;
  buy_rate: number;
  total_cost: number;
  buy_date: string;
  notes: string | null;
  created_at: string;
  stock: { symbol: string };
}

export interface SellTransaction {
  id: number;
  stock_id: number;
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
  id: number;
  stock_id: number;
  dividend_amount: number;
  dividend_date: string;
  notes: string | null;
  created_at: string;
  stock: { symbol: string };
}

export async function addBuyTransaction(data: { 
  stockId: number; 
  quantity: number; 
  buyRate: number; 
  buyDate: Date; 
  notes?: string 
}) {
  const validatedFields = BuyTransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
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
      return { success: false, message: 'Insufficient wallet balance.' };
    }

    // Create Transaction
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

    return { success: true, message: 'Successfully recorded buy transaction.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getBuyTransactions(): Promise<BuyTransaction[]> {
  try {
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
      buy_rate: Number(tx.buy_rate),
      total_cost: Number(tx.total_cost),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch buy transactions.');
  }
}

export async function addSellTransaction(data: { 
  stockId: number; 
  quantity: number; 
  sellRate: number; 
  sellDate: Date; 
  notes?: string 
}) {
  const validatedFields = SellTransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to record sell transaction.',
    };
  }

  const { stockId, quantity: sellQuantity, sellRate, sellDate, notes } = validatedFields.data;

  try {
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
      return { 
        success: false, 
        message: `Insufficient quantity. You only have ${availableQuantity} shares to sell.` 
      };
    }

    // FIFO Calculation
    let costOfSoldShares = 0;
    let quantityToSell = sellQuantity;
    
    // Create a mutable copy of buys with remaining quantities
    const buyLots = (buyTransactions || []).map(tx => ({ 
      ...tx, 
      remaining: tx.quantity,
      buy_rate: Number(tx.buy_rate)
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
      costOfSoldShares += consume * lot.buy_rate;
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

    return { success: true, message: 'Successfully recorded sell transaction.' };

  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getSellTransactions(): Promise<SellTransaction[]> {
  try {
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
      sell_rate: Number(tx.sell_rate),
      total_proceeds: Number(tx.total_proceeds),
      realized_gain_loss: Number(tx.realized_gain_loss),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch sell transactions.');
  }
}

export async function addDividend(data: { 
  stockId: number; 
  dividendAmount: number; 
  dividendDate: Date; 
  notes?: string 
}) {
  const validatedFields = DividendSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add dividend.',
    };
  }

  try {
    const { error } = await supabase
      .from('dividends')
      .insert({
        stock_id: validatedFields.data.stockId,
        dividend_amount: validatedFields.data.dividendAmount,
        dividend_date: validatedFields.data.dividendDate.toISOString(),
        notes: validatedFields.data.notes,
      });

    if (error) throw error;

    return { success: true, message: 'Successfully recorded dividend.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to record dividend.' };
  }
}

export async function getDividends(): Promise<Dividend[]> {
  try {
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
      dividend_amount: Number(d.dividend_amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch dividends.');
  }
}
