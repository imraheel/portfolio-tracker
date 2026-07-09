import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as transactionsService from '@/services/stocks/transactions';
import { queryKeys } from '@/lib/queryKeys';

export function useTransactions() {
  const queryClient = useQueryClient();

  const buyTransactionsQuery = useQuery({
    queryKey: queryKeys.transactions.buys(),
    queryFn: transactionsService.getBuyTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const sellTransactionsQuery = useQuery({
    queryKey: queryKeys.transactions.sells(),
    queryFn: transactionsService.getSellTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const dividendsQuery = useQuery({
    queryKey: queryKeys.transactions.dividends(),
    queryFn: transactionsService.getDividends,
    staleTime: 5 * 60 * 1000,
  });

  const addBuyTransactionMutation = useMutation({
    mutationFn: transactionsService.addBuyTransaction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.buys() });
      }
    },
  });

  const addSellTransactionMutation = useMutation({
    mutationFn: transactionsService.addSellTransaction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.sells() });
      }
    },
  });

  const addDividendMutation = useMutation({
    mutationFn: transactionsService.addDividend,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.dividends() });
      }
    },
  });

  return {
    buyTransactions: buyTransactionsQuery.data ?? [],
    sellTransactions: sellTransactionsQuery.data ?? [],
    dividends: dividendsQuery.data ?? [],
    loading: buyTransactionsQuery.isLoading || sellTransactionsQuery.isLoading || dividendsQuery.isLoading,
    error: buyTransactionsQuery.error ?? sellTransactionsQuery.error ?? dividendsQuery.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    addBuyTransaction: addBuyTransactionMutation.mutateAsync,
    addSellTransaction: addSellTransactionMutation.mutateAsync,
    addDividend: addDividendMutation.mutateAsync,
  };
}
