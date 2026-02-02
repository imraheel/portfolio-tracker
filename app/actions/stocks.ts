'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const StockSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  companyName: z.string().optional(),
  sector: z.string().optional(),
});

export async function addStock(prevState: unknown, formData: FormData) {
  const validatedFields = StockSchema.safeParse({
    symbol: formData.get('symbol'),
    companyName: formData.get('companyName'),
    sector: formData.get('sector'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add stock.',
    };
  }

  const { symbol, companyName, sector } = validatedFields.data;

  try {
    const supabase = await createClient();

    // Check if stock already exists
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('id')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (existingStock) {
      return { message: 'Stock with this symbol already exists.' };
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

    revalidatePath('/stocks');
    return { message: `Added stock ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to add stock.' };
  }
}

export async function getStocks() {
  try {
    const supabase = await createClient();
    
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

const PriceUpdateSchema = z.object({
  stockId: z.coerce.number().int().positive(),
  currentPrice: z.coerce.number().nonnegative(),
});

export async function updateStockPrice(prevState: unknown, formData: FormData) {
  const validatedFields = PriceUpdateSchema.safeParse({
    stockId: formData.get('stockId'),
    currentPrice: formData.get('currentPrice'),
  });

  if (!validatedFields.success) {
    return { message: 'Invalid price data.' };
  }

  const { stockId, currentPrice } = validatedFields.data;

  try {
    const supabase = await createClient();

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

    revalidatePath('/');
    revalidatePath('/stocks');
    return { message: 'Price updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to update price.' };
  }
}
