'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function exportDataAsJson() {
  try {
    const deposits = await prisma.deposit.findMany();
    const stocks = await prisma.stock.findMany();
    const buyTransactions = await prisma.stockBuyTransaction.findMany();
    const sellTransactions = await prisma.stockSellTransaction.findMany();
    const dividends = await prisma.dividend.findMany();
    const stockPrices = await prisma.stockPrice.findMany();

    // Create a symbol-based map for portability
    const stockMap = new Map(stocks.map(s => [s.id, s.symbol]));

    const masterData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      stocks: stocks.map(({ id, ...rest }) => ({ ...rest })), // Keep stocks for master list
      deposits: deposits.map(({ id, ...rest }) => ({ ...rest })),
      buyTransactions: buyTransactions.map(({ id, stockId, ...rest }) => ({ 
        ...rest, 
        symbol: stockMap.get(stockId) 
      })),
      sellTransactions: sellTransactions.map(({ id, stockId, ...rest }) => ({ 
        ...rest, 
        symbol: stockMap.get(stockId) 
      })),
      dividends: dividends.map(({ id, stockId, ...rest }) => ({ 
        ...rest, 
        symbol: stockMap.get(stockId) 
      })),
      stockPrices: stockPrices.map(({ id, stockId, ...rest }) => ({ 
        ...rest, 
        symbol: stockMap.get(stockId) 
      })),
    };

    return { 
      success: true, 
      data: JSON.stringify(masterData, null, 2),
      filename: `psit_backup_${new Date().toISOString().split('T')[0]}.txt`
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to export data.' };
  }
}

export async function importDataFromJson(prevState: any, jsonString: string) {
  try {
    const masterData = JSON.parse(jsonString);

    if (!masterData.stocks || !masterData.deposits) {
      throw new Error('Invalid backup file format.');
    }

    // 1. Clear all existing data in reverse order of dependencies
    await prisma.$transaction([
      prisma.dividend.deleteMany(),
      prisma.stockSellTransaction.deleteMany(),
      prisma.stockBuyTransaction.deleteMany(),
      prisma.stockPrice.deleteMany(),
      prisma.deposit.deleteMany(),
      prisma.stock.deleteMany(),
    ]);

    // 2. Insert Stocks first to generate new IDs
    await prisma.stock.createMany({
      data: masterData.stocks.map((s: any) => ({
        symbol: s.symbol,
        companyName: s.companyName,
        sector: s.sector,
        createdAt: new Date(s.createdAt)
      }))
    });

    const newStocks = await prisma.stock.findMany();
    const symbolToIdMap = new Map(newStocks.map(s => [s.symbol, s.id]));

    // 3. Insert remaining data using the new ID map
    await prisma.$transaction([
      prisma.deposit.createMany({
        data: masterData.deposits.map((d: any) => ({
          amount: new Prisma.Decimal(d.amount),
          depositDate: new Date(d.depositDate),
          note: d.note,
          createdAt: new Date(d.createdAt)
        }))
      }),
      prisma.stockBuyTransaction.createMany({
        data: masterData.buyTransactions.map((t: any) => ({
          stockId: symbolToIdMap.get(t.symbol)!,
          quantity: t.quantity,
          buyRate: new Prisma.Decimal(t.buyRate),
          totalCost: new Prisma.Decimal(t.totalCost),
          buyDate: new Date(t.buyDate),
          notes: t.notes,
          createdAt: new Date(t.createdAt)
        }))
      }),
      prisma.stockSellTransaction.createMany({
        data: masterData.sellTransactions.map((t: any) => ({
          stockId: symbolToIdMap.get(t.symbol)!,
          quantity: t.quantity,
          sellRate: new Prisma.Decimal(t.sellRate),
          totalProceeds: new Prisma.Decimal(t.totalProceeds),
          realizedGainLoss: new Prisma.Decimal(t.realizedGainLoss),
          sellDate: new Date(t.sellDate),
          notes: t.notes,
          createdAt: new Date(t.createdAt)
        }))
      }),
      prisma.dividend.createMany({
        data: masterData.dividends.map((d: any) => ({
          stockId: symbolToIdMap.get(d.symbol)!,
          dividendAmount: new Prisma.Decimal(d.dividendAmount),
          dividendDate: new Date(d.dividendDate),
          notes: d.notes,
          createdAt: new Date(d.createdAt)
        }))
      }),
      prisma.stockPrice.createMany({
        data: masterData.stockPrices.map((p: any) => ({
          stockId: symbolToIdMap.get(p.symbol)!,
          currentPrice: new Prisma.Decimal(p.currentPrice),
          updatedAt: new Date(p.updatedAt)
        }))
      }),
    ]);

    revalidatePath('/', 'layout');
    return { success: true, message: 'Master data imported successfully!' };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}