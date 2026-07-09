import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cryptoService from '@/services/crypto/crypto';
import { queryKeys } from '@/lib/queryKeys';

export function useCrypto() {
  const queryClient = useQueryClient();

  const cryptocurrenciesQuery = useQuery({
    queryKey: queryKeys.crypto.list(),
    queryFn: cryptoService.getCryptocurrencies,
    staleTime: 10 * 60 * 1000,
  });

  const purchasesQuery = useQuery({
    queryKey: queryKeys.crypto.purchases(),
    queryFn: cryptoService.getPurchases,
    staleTime: 5 * 60 * 1000,
  });

  const withdrawalsQuery = useQuery({
    queryKey: queryKeys.crypto.withdrawals(),
    queryFn: cryptoService.getWithdrawals,
    staleTime: 5 * 60 * 1000,
  });

  const metricsQuery = useQuery({
    queryKey: queryKeys.crypto.metrics(),
    queryFn: cryptoService.getAllCryptoMetrics,
    staleTime: 2 * 60 * 1000,
  });

  const addCryptocurrencyMutation = useMutation({
    mutationFn: cryptoService.addCryptocurrency,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.list() });
      }
    },
  });

  const updateTotalValueMutation = useMutation({
    mutationFn: cryptoService.updateTotalValue,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.list() });
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.metrics() });
      }
    },
  });

  const addPurchaseMutation = useMutation({
    mutationFn: cryptoService.addPurchase,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.purchases() });
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.metrics() });
      }
    },
  });

  const addWithdrawalMutation = useMutation({
    mutationFn: cryptoService.addWithdrawal,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.withdrawals() });
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.metrics() });
      }
    },
  });

  return {
    cryptocurrencies: cryptocurrenciesQuery.data ?? [],
    purchases: purchasesQuery.data ?? [],
    withdrawals: withdrawalsQuery.data ?? [],
    metrics: metricsQuery.data ?? [],
    loading: cryptocurrenciesQuery.isLoading || purchasesQuery.isLoading || withdrawalsQuery.isLoading || metricsQuery.isLoading,
    error: cryptocurrenciesQuery.error ?? purchasesQuery.error ?? withdrawalsQuery.error ?? metricsQuery.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.crypto.all }),
    addCryptocurrency: addCryptocurrencyMutation.mutateAsync,
    updateTotalValue: updateTotalValueMutation.mutateAsync,
    addPurchase: addPurchaseMutation.mutateAsync,
    addWithdrawal: addWithdrawalMutation.mutateAsync,
  };
}
