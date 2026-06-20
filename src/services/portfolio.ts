import { db } from '@/lib/firebase/client';
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';

interface BuyTransaction {
  symbol: string;
  quantity: number;
  buy_rate: number | string;
  total_cost: number | string;
  buy_date: string;
}

interface SellTransaction {
  symbol: string;
  quantity: number;
  sell_rate: number | string;
  total_proceeds: number | string;
  realized_gain_loss: number | string;
  sell_date: string;
}

interface Dividend {
  symbol: string;
  dividend_amount: number | string;
  dividend_date: string;
}

export interface HoldingMetric {
  symbol: string;
  totalBuyQty: number;
  totalSellQty: number;
  remainingQty: number;
  avgBuyPrice: number;
  investedAmount: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  realizedGainLoss: number;
  totalDividends: number;
}

export async function getPortfolioMetrics(): Promise<HoldingMetric[]> {
  const [stocksSnap, buySnap, sellSnap, dividendsSnap, pricesSnap] = await Promise.all([
    getDocs(query(collection(db, 'stocks'), orderBy('symbol', 'asc'))),
    getDocs(collection(db, 'stock_buy_transactions')),
    getDocs(collection(db, 'stock_sell_transactions')),
    getDocs(collection(db, 'dividends')),
    getDocs(collection(db, 'stock_prices')),
  ]);

  const priceMap = new Map<string, number>();
  pricesSnap.docs.forEach(p => {
    const data = p.data() as { current_price: number };
    priceMap.set(p.id, Number(data.current_price));
  });

  const buysBySymbol = new Map<string, BuyTransaction[]>();
  buySnap.docs.forEach(d => {
    const data = d.data() as BuyTransaction;
    if (!buysBySymbol.has(data.symbol)) buysBySymbol.set(data.symbol, []);
    buysBySymbol.get(data.symbol)!.push(data);
  });

  const sellsBySymbol = new Map<string, SellTransaction[]>();
  sellSnap.docs.forEach(d => {
    const data = d.data() as SellTransaction;
    if (!sellsBySymbol.has(data.symbol)) sellsBySymbol.set(data.symbol, []);
    sellsBySymbol.get(data.symbol)!.push(data);
  });

  const divsBySymbol = new Map<string, Dividend[]>();
  dividendsSnap.docs.forEach(d => {
    const data = d.data() as Dividend;
    if (!divsBySymbol.has(data.symbol)) divsBySymbol.set(data.symbol, []);
    divsBySymbol.get(data.symbol)!.push(data);
  });

  const metrics: HoldingMetric[] = [];

  for (const stockDoc of stocksSnap.docs) {
    const symbol = stockDoc.id;
    const buyTransactions = buysBySymbol.get(symbol) || [];
    const sellTransactions = sellsBySymbol.get(symbol) || [];
    const dividends = divsBySymbol.get(symbol) || [];

    const totalBuyQty = buyTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const totalSellQty = sellTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const remainingQty = totalBuyQty - totalSellQty;

    const realizedGainLoss = sellTransactions.reduce((sum, tx) =>
      sum + Number(tx.realized_gain_loss), 0);

    const totalDividends = dividends.reduce((sum, d) =>
      sum + Number(d.dividend_amount), 0);

    const currentPrice = priceMap.get(symbol) || 0;

    let investedAmount = 0;
    let avgBuyPrice = 0;

    if (remainingQty > 0) {
      const buyLots = buyTransactions.map(tx => ({
        remaining: tx.quantity,
        buyRate: Number(tx.buy_rate),
      }));

      let soldQtyCounter = totalSellQty;
      for (const lot of buyLots) {
        if (soldQtyCounter === 0) break;
        const consume = Math.min(lot.remaining, soldQtyCounter);
        lot.remaining -= consume;
        soldQtyCounter -= consume;
      }

      for (const lot of buyLots) {
        if (lot.remaining > 0) {
          investedAmount += lot.remaining * lot.buyRate;
        }
      }
      avgBuyPrice = investedAmount / remainingQty;
    }

    const currentValue = remainingQty * currentPrice;
    const unrealizedGainLoss = currentValue - investedAmount;

    metrics.push({
      symbol,
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

  return metrics.filter(m =>
    m.remainingQty > 0 ||
    Math.abs(m.realizedGainLoss) > 0 ||
    Math.abs(m.totalDividends) > 0
  );
}
