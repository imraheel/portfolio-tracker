'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const StockSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10),
  companyName: z.string().optional(),
  sector: z.string().optional(),
});

export async function addStock(prevState: any, formData: FormData) {
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
    const existingStock = await prisma.stock.findUnique({
      where: { symbol },
    });

    if (existingStock) {
      return { message: 'Stock with this symbol already exists.' };
    }

    await prisma.stock.create({
      data: {
        symbol: symbol.toUpperCase(),
        companyName,
        sector,
      },
    });

    revalidatePath('/stocks'); // Revalidate the stocks page
    return { message: `Added stock ${symbol.toUpperCase()}.` };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to add stock.' };
  }
}

export async function getStocks() {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: {
        symbol: 'asc',
      },
    });
    return stocks;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stocks.');
  }
}

const PriceUpdateSchema = z.object({
  stockId: z.coerce.number().int().positive(),
  currentPrice: z.coerce.number().nonnegative(),
});

export async function updateStockPrice(prevState: any, formData: FormData) {
    const validatedFields = PriceUpdateSchema.safeParse({
        stockId: formData.get('stockId'),
        currentPrice: formData.get('currentPrice'),
    });

    if (!validatedFields.success) {
        return { message: 'Invalid price data.' };
    }

    const { stockId, currentPrice } = validatedFields.data;

    try {
        await prisma.stockPrice.upsert({
            where: { stockId },
            update: { currentPrice },
            create: { stockId, currentPrice },
        });

        revalidatePath('/'); // Revalidate dashboard
        revalidatePath('/stocks');
        return { message: 'Price updated.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to update price.' };
    }
}
