import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as mutualFundsService from '@/services/mutualFunds/mutualFunds';
import { queryKeys } from '@/lib/queryKeys';

export function useMutualFunds() {
  const queryClient = useQueryClient();

  const fundsQuery = useQuery({
    queryKey: queryKeys.mutualFunds.list(),
    queryFn: mutualFundsService.getMutualFunds,
    staleTime: 10 * 60 * 1000,
  });

  const purchasesQuery = useQuery({
    queryKey: queryKeys.mutualFunds.purchases(),
    queryFn: mutualFundsService.getPurchases,
    staleTime: 5 * 60 * 1000,
  });

  const withdrawalsQuery = useQuery({
    queryKey: queryKeys.mutualFunds.withdrawals(),
    queryFn: mutualFundsService.getWithdrawals,
    staleTime: 5 * 60 * 1000,
  });

  const metricsQuery = useQuery({
    queryKey: queryKeys.mutualFunds.metrics(),
    queryFn: mutualFundsService.getAllFundMetrics,
    staleTime: 2 * 60 * 1000,
  });

  const addFundMutation = useMutation({
    mutationFn: mutualFundsService.addMutualFund,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.list() });
      }
    },
  });

  const updateMarketValueMutation = useMutation({
    mutationFn: mutualFundsService.updateMarketValue,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.list() });
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.metrics() });
      }
    },
  });

  const addPurchaseMutation = useMutation({
    mutationFn: mutualFundsService.addPurchase,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.purchases() });
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.metrics() });
      }
    },
  });

  const addWithdrawalMutation = useMutation({
    mutationFn: mutualFundsService.addWithdrawal,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.withdrawals() });
        queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.metrics() });
      }
    },
  });

  return {
    funds: fundsQuery.data ?? [],
    purchases: purchasesQuery.data ?? [],
    withdrawals: withdrawalsQuery.data ?? [],
    metrics: metricsQuery.data ?? [],
    loading: fundsQuery.isLoading || purchasesQuery.isLoading || withdrawalsQuery.isLoading || metricsQuery.isLoading,
    error: fundsQuery.error ?? purchasesQuery.error ?? withdrawalsQuery.error ?? metricsQuery.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.mutualFunds.all }),
    addFund: addFundMutation.mutateAsync,
    updateMarketValue: updateMarketValueMutation.mutateAsync,
    addPurchase: addPurchaseMutation.mutateAsync,
    addWithdrawal: addWithdrawalMutation.mutateAsync,
  };
}
