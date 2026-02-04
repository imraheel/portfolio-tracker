import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

const StockSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  companyName: z.string().optional(),
  sector: z.string().optional(),
});

const PriceUpdateSchema = z.object({
  stockId: z.number().int().positive(),
  currentPrice: z.number().nonnegative(),
});

export interface Stock {
  id: number;
  symbol: string;
  company_name: string | null;
  sector: string | null;
  created_at: string;
}

export interface StockPrice {
  id: number;
  stock_id: number;
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

  try {
    // Check if stock already exists
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('id')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (existingStock) {
      return { success: false, message: 'Stock with this symbol already exists.' };
    }

    // Insert new stock
    const { error } = await supabase
      .from('stocks')
      .insert({
        symbol: symbol.toUpperCase(),
        company_name: companyName,
        sector: sector,
      });

    if (error) throw error;

    return { success: true, message: `Added stock ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to add stock.' };
  }
}

export async function getStocks(): Promise<Stock[]> {
  try {
    const { data: stocks, error } = await supabase
      .from('stocks')
      .select('*')
      .order('symbol', { ascending: true });

    if (error) throw error;

    return stocks || [];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stocks.');
  }
}

export async function updateStockPrice(data: { stockId: number; currentPrice: number }) {
  const validatedFields = PriceUpdateSchema.safeParse(data);

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid price data.' };
  }

  const { stockId, currentPrice } = validatedFields.data;

  try {
    // Check if price record exists
    const { data: existingPrice } = await supabase
      .from('stock_prices')
      .select('id')
      .eq('stock_id', stockId)
      .single();

    if (existingPrice) {
      // Update existing price
      const { error } = await supabase
        .from('stock_prices')
        .update({ current_price: currentPrice })
        .eq('stock_id', stockId);
      
      if (error) throw error;
    } else {
      // Insert new price
      const { error } = await supabase
        .from('stock_prices')
        .insert({
          stock_id: stockId,
          current_price: currentPrice,
        });
      
      if (error) throw error;
    }

    return { success: true, message: 'Price updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to update price.' };
  }
}

export async function getStockPrices(): Promise<StockPrice[]> {
  try {
    const { data: prices, error } = await supabase
      .from('stock_prices')
      .select('*');

    if (error) throw error;

    return (prices || []).map(p => ({
      ...p,
      current_price: Number(p.current_price),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stock prices.');
  }
}
