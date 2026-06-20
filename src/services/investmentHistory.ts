import { db } from '@/lib/firebase/client';
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';

export interface InvestmentHistoryPoint {
  date: string;
  stocksInvestment: number;
  mutualFundsInvestment: number;
  cryptoInvestment: number;
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

export async function getInvestmentHistory(days: number = 365): Promise<InvestmentHistoryPoint[]> {
  const [
    depositsSnap,
    withdrawalsSnap,
    fundPurchasesSnap,
    fundWithdrawalsSnap,
    cryptoPurchasesSnap,
    cryptoWithdrawalsSnap,
  ] = await Promise.all([
    getDocs(query(collection(db, 'deposits'), orderBy('deposit_date', 'asc'))),
    getDocs(query(collection(db, 'withdrawals'), orderBy('withdrawal_date', 'asc'))),
    getDocs(query(collection(db, 'mutual_fund_purchases'), orderBy('purchase_date', 'asc'))),
    getDocs(query(collection(db, 'mutual_fund_withdrawals'), orderBy('withdrawal_date', 'asc'))),
    getDocs(query(collection(db, 'crypto_purchases'), orderBy('purchase_date', 'asc'))),
    getDocs(query(collection(db, 'crypto_withdrawals'), orderBy('withdrawal_date', 'asc'))),
  ]);

  const events: { date: string; stocks: number; mutualFunds: number; crypto: number }[] = [];

  depositsSnap.docs.forEach(d => {
    const data = d.data() as { amount: number | string; deposit_date: string };
    events.push({ date: getDateKey(data.deposit_date), stocks: Number(data.amount), mutualFunds: 0, crypto: 0 });
  });

  withdrawalsSnap.docs.forEach(w => {
    const data = w.data() as { amount: number | string; withdrawal_date: string };
    events.push({ date: getDateKey(data.withdrawal_date), stocks: -Number(data.amount), mutualFunds: 0, crypto: 0 });
  });

  fundPurchasesSnap.docs.forEach(p => {
    const data = p.data() as { amount: number | string; purchase_date: string };
    events.push({ date: getDateKey(data.purchase_date), stocks: 0, mutualFunds: Number(data.amount), crypto: 0 });
  });

  fundWithdrawalsSnap.docs.forEach(w => {
    const data = w.data() as { amount: number | string; withdrawal_date: string };
    events.push({ date: getDateKey(data.withdrawal_date), stocks: 0, mutualFunds: -Number(data.amount), crypto: 0 });
  });

  cryptoPurchasesSnap.docs.forEach(p => {
    const data = p.data() as { amount_pkr: number | string; purchase_date: string };
    events.push({ date: getDateKey(data.purchase_date), stocks: 0, mutualFunds: 0, crypto: Number(data.amount_pkr) });
  });

  cryptoWithdrawalsSnap.docs.forEach(w => {
    const data = w.data() as { amount_pkr: number | string; withdrawal_date: string };
    events.push({ date: getDateKey(data.withdrawal_date), stocks: 0, mutualFunds: 0, crypto: -Number(data.amount_pkr) });
  });

  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dateMap = new Map<string, { stocks: number; mutualFunds: number; crypto: number }>();
  let cumulativeStocks = 0;
  let cumulativeMutualFunds = 0;
  let cumulativeCrypto = 0;

  for (const event of sortedEvents) {
    cumulativeStocks += event.stocks;
    cumulativeMutualFunds += event.mutualFunds;
    cumulativeCrypto += event.crypto;

    const existing = dateMap.get(event.date);
    if (existing) {
      existing.stocks = cumulativeStocks;
      existing.mutualFunds = cumulativeMutualFunds;
      existing.crypto = cumulativeCrypto;
    } else {
      dateMap.set(event.date, { stocks: cumulativeStocks, mutualFunds: cumulativeMutualFunds, crypto: cumulativeCrypto });
    }
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const history: InvestmentHistoryPoint[] = [];
  const currentDate = new Date(startDate);
  let lastStocks = 0;
  let lastMutualFunds = 0;
  let lastCrypto = 0;

  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayData = dateMap.get(dateKey);

    if (dayData) {
      lastStocks = dayData.stocks;
      lastMutualFunds = dayData.mutualFunds;
      lastCrypto = dayData.crypto;
    }

    history.push({
      date: dateKey,
      stocksInvestment: lastStocks,
      mutualFundsInvestment: lastMutualFunds,
      cryptoInvestment: lastCrypto,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return history;
}
