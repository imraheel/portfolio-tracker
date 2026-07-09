export const queryKeys = {
  stocks: {
    all: ['stocks'] as const,
    list: () => [...queryKeys.stocks.all, 'list'] as const,
    prices: () => [...queryKeys.stocks.all, 'prices'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    buys: () => [...queryKeys.transactions.all, 'buys'] as const,
    sells: () => [...queryKeys.transactions.all, 'sells'] as const,
    dividends: () => [...queryKeys.transactions.all, 'dividends'] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    deposits: () => [...queryKeys.wallet.all, 'deposits'] as const,
    withdrawals: () => [...queryKeys.wallet.all, 'withdrawals'] as const,
    balance: () => [...queryKeys.wallet.all, 'balance'] as const,
  },
  portfolio: {
    all: ['portfolio'] as const,
    metrics: () => [...queryKeys.portfolio.all, 'metrics'] as const,
  },
  crypto: {
    all: ['crypto'] as const,
    list: () => [...queryKeys.crypto.all, 'list'] as const,
    purchases: () => [...queryKeys.crypto.all, 'purchases'] as const,
    withdrawals: () => [...queryKeys.crypto.all, 'withdrawals'] as const,
    metrics: () => [...queryKeys.crypto.all, 'metrics'] as const,
  },
  mutualFunds: {
    all: ['mutualFunds'] as const,
    list: () => [...queryKeys.mutualFunds.all, 'list'] as const,
    purchases: () => [...queryKeys.mutualFunds.all, 'purchases'] as const,
    withdrawals: () => [...queryKeys.mutualFunds.all, 'withdrawals'] as const,
    metrics: () => [...queryKeys.mutualFunds.all, 'metrics'] as const,
  },
  investmentHistory: (days: number) => ['investmentHistory', days] as const,
};
