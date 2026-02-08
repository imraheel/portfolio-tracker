import { supabase } from '@/lib/supabase/client';

export interface InvestmentHistoryPoint {
  date: string;
  stocksInvestment: number;
  mutualFundsInvestment: number;
  cryptoInvestment: number;
}

interface Deposit {
  amount: number | string;
  deposit_date: string;
}

interface Withdrawal {
  amount: number | string;
  withdrawal_date: string;
}

interface MutualFundPurchase {
  amount: number | string;
  purchase_date: string;
}

interface MutualFundWithdrawal {
  amount: number | string;
  withdrawal_date: string;
}

interface CryptoPurchase {
  amount_pkr: number | string;
  purchase_date: string;
}

interface CryptoWithdrawal {
  amount_pkr: number | string;
  withdrawal_date: string;
}

async function fetchAllData() {
  const [
    { data: deposits, error: depositsError },
    { data: withdrawals, error: withdrawalsError },
    { data: fundPurchases, error: fundPurchasesError },
    { data: fundWithdrawals, error: fundWithdrawalsError },
    { data: cryptoPurchases, error: cryptoPurchasesError },
    { data: cryptoWithdrawals, error: cryptoWithdrawalsError },
  ] = await Promise.all([
    supabase.from('deposits').select('amount, deposit_date').order('deposit_date'),
    supabase.from('withdrawals').select('amount, withdrawal_date').order('withdrawal_date'),
    supabase.from('mutual_fund_purchases').select('amount, purchase_date').order('purchase_date'),
    supabase.from('mutual_fund_withdrawals').select('amount, withdrawal_date').order('withdrawal_date'),
    supabase.from('crypto_purchases').select('amount_pkr, purchase_date').order('purchase_date'),
    supabase.from('crypto_withdrawals').select('amount_pkr, withdrawal_date').order('withdrawal_date'),
  ]);

  if (depositsError || withdrawalsError || fundPurchasesError || fundWithdrawalsError ||
      cryptoPurchasesError || cryptoWithdrawalsError) {
    throw new Error('Failed to fetch investment history data');
  }

  return {
    deposits: deposits || [],
    withdrawals: withdrawals || [],
    fundPurchases: fundPurchases || [],
    fundWithdrawals: fundWithdrawals || [],
    cryptoPurchases: cryptoPurchases || [],
    cryptoWithdrawals: cryptoWithdrawals || [],
  };
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

export async function getInvestmentHistory(days: number = 365): Promise<InvestmentHistoryPoint[]> {
  const data = await fetchAllData();

  const events: {
    date: string;
    stocks: number;
    mutualFunds: number;
    crypto: number;
  }[] = [];

  // Stocks: Deposits increase investment
  data.deposits.forEach((d: Deposit) => {
    events.push({
      date: getDateKey(d.deposit_date),
      stocks: Number(d.amount),
      mutualFunds: 0,
      crypto: 0,
    });
  });

  // Stocks: Withdrawals decrease investment
  data.withdrawals.forEach((w: Withdrawal) => {
    events.push({
      date: getDateKey(w.withdrawal_date),
      stocks: -Number(w.amount),
      mutualFunds: 0,
      crypto: 0,
    });
  });

  data.fundPurchases.forEach((p: MutualFundPurchase) => {
    events.push({
      date: getDateKey(p.purchase_date),
      stocks: 0,
      mutualFunds: Number(p.amount),
      crypto: 0,
    });
  });

  data.fundWithdrawals.forEach((w: MutualFundWithdrawal) => {
    events.push({
      date: getDateKey(w.withdrawal_date),
      stocks: 0,
      mutualFunds: -Number(w.amount),
      crypto: 0,
    });
  });

  data.cryptoPurchases.forEach((p: CryptoPurchase) => {
    events.push({
      date: getDateKey(p.purchase_date),
      stocks: 0,
      mutualFunds: 0,
      crypto: Number(p.amount_pkr),
    });
  });

  data.cryptoWithdrawals.forEach((w: CryptoWithdrawal) => {
    events.push({
      date: getDateKey(w.withdrawal_date),
      stocks: 0,
      mutualFunds: 0,
      crypto: -Number(w.amount_pkr),
    });
  });

  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dateMap = new Map<string, {
    stocks: number;
    mutualFunds: number;
    crypto: number;
  }>();

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
      dateMap.set(event.date, {
        stocks: cumulativeStocks,
        mutualFunds: cumulativeMutualFunds,
        crypto: cumulativeCrypto,
      });
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
      history.push({
        date: dateKey,
        stocksInvestment: lastStocks,
        mutualFundsInvestment: lastMutualFunds,
        cryptoInvestment: lastCrypto,
      });
    } else {
      history.push({
        date: dateKey,
        stocksInvestment: lastStocks,
        mutualFundsInvestment: lastMutualFunds,
        cryptoInvestment: lastCrypto,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return history;
}
