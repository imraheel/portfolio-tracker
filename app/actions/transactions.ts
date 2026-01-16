'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getWalletBalance } from './wallet'; // We'll need this for validation

const BuyTransactionSchema = z.object({
  stockId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  buyRate: z.coerce.number().positive(),
  buyDate: z.coerce.date(),
  notes: z.string().optional(),
});

export async function addBuyTransaction(prevState: any, formData: FormData) {
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
    //
    // === Validation: Check Wallet Balance ===
    //
    const currentBalance = await getWalletBalance();
    if (currentBalance < totalCost) {
      return { message: 'Insufficient wallet balance.' };
    }

    //
    // === Create Transaction ===
    //
    await prisma.stockBuyTransaction.create({
      data: {
        stockId,
        quantity,
        buyRate,
        totalCost,
        buyDate,
        notes,
      },
    });

    revalidatePath('/'); // Revalidate dashboard
    revalidatePath('/transactions'); // Revalidate transactions page
    return { message: 'Successfully recorded buy transaction.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to record transaction.' };
  }
}

export async function getBuyTransactions() {
  try {
    const transactions = await prisma.stockBuyTransaction.findMany({
      include: {
        stock: {
          select: {
            symbol: true,
          },
        },
      },
      orderBy: {
        buyDate: 'desc',
      },
    });
    return transactions;
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

export async function addSellTransaction(prevState: any, formData: FormData) {
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
        const buyTransactions = await prisma.stockBuyTransaction.findMany({
            where: { stockId },
            orderBy: { buyDate: 'asc' },
        });

        const sellTransactions = await prisma.stockSellTransaction.findMany({
            where: { stockId },
            orderBy: { sellDate: 'asc' },
        });

        const totalBought = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
        const totalSold = sellTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
        const availableQuantity = totalBought - totalSold;

        if (sellQuantity > availableQuantity) {
            return { message: `Insufficient quantity. You only have ${availableQuantity} shares to sell.` };
        }

        // FIFO Calculation
        let costOfSoldShares = 0;
        let quantityToSell = sellQuantity;
        
        // Create a mutable copy of buys with remaining quantities
        const buyLots = buyTransactions.map(tx => ({ ...tx, remaining: tx.quantity }));

        // First, account for previous sells
        for (const sellTx of sellTransactions) {
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
            costOfSoldShares += consume * parseFloat(lot.buyRate.toString());
            quantityToSell -= consume;
        }

        const totalProceeds = sellQuantity * sellRate;
        const realizedGainLoss = totalProceeds - costOfSoldShares;

        await prisma.stockSellTransaction.create({
            data: {
                stockId,
                quantity: sellQuantity,
                sellRate,
                totalProceeds,
                realizedGainLoss,
                sellDate,
                notes,
            },
        });

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
    const transactions = await prisma.stockSellTransaction.findMany({
      include: {
        stock: {
          select: {
            symbol: true,
          },
        },
      },
      orderBy: {
        sellDate: 'desc',
      },
    });
    return transactions;
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

export async function addDividend(prevState: any, formData: FormData) {
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
    await prisma.dividend.create({
      data: validatedFields.data,
    });

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
    const dividends = await prisma.dividend.findMany({
      include: {
        stock: {
          select: {
            symbol: true,
          },
        },
      },
      orderBy: {
        dividendDate: 'desc',
      },
    });
    return dividends;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch dividends.');
  }
}
