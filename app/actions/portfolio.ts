'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface HoldingMetric {
  stockId: number;
  symbol: string;
  
  totalBuyQty: number;
  totalSellQty: number;
  remainingQty: number;
  
  avgBuyPrice: Prisma.Decimal;
  investedAmount: Prisma.Decimal;
  
  currentPrice: Prisma.Decimal;
  currentValue: Prisma.Decimal;
  unrealizedGainLoss: Prisma.Decimal;
  
  realizedGainLoss: Prisma.Decimal;
  totalDividends: Prisma.Decimal;
}

export async function getPortfolioMetrics(): Promise<HoldingMetric[]> {
  const stocks = await prisma.stock.findMany({
    include: {
      buyTransactions: { orderBy: { buyDate: 'asc' } },
      sellTransactions: { orderBy: { sellDate: 'asc' } },
      dividends: true,
      currentPrice: true,
    },
  });

  const metrics: HoldingMetric[] = [];

  for (const stock of stocks) {
    const totalBuyQty = stock.buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const totalSellQty = stock.sellTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const remainingQty = totalBuyQty - totalSellQty;

    const realizedGainLoss = stock.sellTransactions.reduce((sum, tx) => sum.add(tx.realizedGainLoss), new Prisma.Decimal(0));
    const totalDividends = stock.dividends.reduce((sum, tx) => sum.add(tx.dividendAmount), new Prisma.Decimal(0));
    const currentPrice = stock.currentPrice?.currentPrice ?? new Prisma.Decimal(0);

    let investedAmount = new Prisma.Decimal(0);
    let avgBuyPrice = new Prisma.Decimal(0);

    if (remainingQty > 0) {
      // FIFO logic to find the cost basis of remaining shares
      const buyLots = stock.buyTransactions.map(tx => ({ ...tx, remaining: tx.quantity }));
      
      let soldQtyCounter = totalSellQty;
      for (const lot of buyLots) {
        if (soldQtyCounter === 0) break;
        const consume = Math.min(lot.remaining, soldQtyCounter);
        lot.remaining -= consume;
        soldQtyCounter -= consume;
      }

      // Calculate invested amount from the lots that have remaining shares
      for (const lot of buyLots) {
        if (lot.remaining > 0) {
          investedAmount = investedAmount.add(new Prisma.Decimal(lot.remaining).mul(lot.buyRate));
        }
      }
      avgBuyPrice = investedAmount.div(remainingQty);
    }
    
    const currentValue = new Prisma.Decimal(remainingQty).mul(currentPrice);
    const unrealizedGainLoss = currentValue.sub(investedAmount);

    metrics.push({
      stockId: stock.id,
      symbol: stock.symbol,
      totalBuyQty,
      totalSellQty,
      remainingQty,
      avgBuyPrice,
      investedAmount,
      currentPrice,
      currentValue,
      unrealizedGainLoss,
      realizedGainLoss,
      totalDividends,
    });
  }

  return metrics.filter(m => m.remainingQty > 0 || m.realizedGainLoss.abs().greaterThan(0) || m.totalDividends.abs().greaterThan(0));
}
