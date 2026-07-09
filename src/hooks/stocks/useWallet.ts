import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletService from '@/services/stocks/wallet';
import { queryKeys } from '@/lib/queryKeys';

export function useWallet() {
  const queryClient = useQueryClient();

  const depositsQuery = useQuery({
    queryKey: queryKeys.wallet.deposits(),
    queryFn: walletService.getDeposits,
    staleTime: 5 * 60 * 1000,
  });

  const withdrawalsQuery = useQuery({
    queryKey: queryKeys.wallet.withdrawals(),
    queryFn: walletService.getWithdrawals,
    staleTime: 5 * 60 * 1000,
  });

  const balanceQuery = useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: walletService.getWalletBalance,
    staleTime: 30 * 1000,
  });

  const addDepositMutation = useMutation({
    mutationFn: walletService.addDeposit,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.deposits() });
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      }
    },
  });

  const deleteDepositMutation = useMutation({
    mutationFn: walletService.deleteDeposit,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.deposits() });
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      }
    },
  });

  const addWithdrawalMutation = useMutation({
    mutationFn: walletService.addWithdrawal,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.withdrawals() });
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      }
    },
  });

  const deleteWithdrawalMutation = useMutation({
    mutationFn: walletService.deleteWithdrawal,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.withdrawals() });
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      }
    },
  });

  const deposits = depositsQuery.data ?? [];
  const withdrawals = withdrawalsQuery.data ?? [];

  const totalDeposited = useMemo(() => deposits.reduce((sum, d) => sum + d.amount, 0), [deposits]);
  const totalWithdrawn = useMemo(() => withdrawals.reduce((sum, w) => sum + w.amount, 0), [withdrawals]);

  return {
    deposits,
    withdrawals,
    balance: balanceQuery.data ?? 0,
    totalDeposited,
    totalWithdrawn,
    netDeposits: totalDeposited - totalWithdrawn,
    loading: depositsQuery.isLoading || withdrawalsQuery.isLoading || balanceQuery.isLoading,
    error: depositsQuery.error ?? withdrawalsQuery.error ?? balanceQuery.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all }),
    addDeposit: addDepositMutation.mutateAsync,
    deleteDeposit: deleteDepositMutation.mutateAsync,
    addWithdrawal: addWithdrawalMutation.mutateAsync,
    deleteWithdrawal: deleteWithdrawalMutation.mutateAsync,
  };
}
