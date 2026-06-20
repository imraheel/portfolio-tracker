import { useState, useEffect, useCallback } from 'react';
import * as walletService from '@/services/stocks/wallet';
import type { Deposit, Withdrawal } from '@/services/stocks/wallet';

export function useWallet() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletService.getDeposits();
      setDeposits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deposits');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const data = await walletService.getWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const bal = await walletService.getWalletBalance();
      setBalance(bal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    }
  }, []);

  const addDeposit = useCallback(async (data: { amount: number; depositDate: Date; note?: string }) => {
    const result = await walletService.addDeposit(data);
    if (result.success) {
      await fetchDeposits();
      await fetchBalance();
    }
    return result;
  }, [fetchDeposits, fetchBalance]);

  const deleteDeposit = useCallback(async (id: string) => {
    const result = await walletService.deleteDeposit(id);
    if (result.success) {
      await fetchDeposits();
      await fetchBalance();
    }
    return result;
  }, [fetchDeposits, fetchBalance]);

  const addWithdrawal = useCallback(async (data: { amount: number; withdrawalDate: Date; note?: string }) => {
    const result = await walletService.addWithdrawal(data);
    if (result.success) {
      await fetchWithdrawals();
      await fetchBalance();
    }
    return result;
  }, [fetchWithdrawals, fetchBalance]);

  const deleteWithdrawal = useCallback(async (id: string) => {
    const result = await walletService.deleteWithdrawal(id);
    if (result.success) {
      await fetchWithdrawals();
      await fetchBalance();
    }
    return result;
  }, [fetchWithdrawals, fetchBalance]);

  useEffect(() => {
    fetchDeposits();
    fetchWithdrawals();
    fetchBalance();
  }, [fetchDeposits, fetchWithdrawals, fetchBalance]);

  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return {
    deposits,
    withdrawals,
    balance,
    totalDeposited,
    totalWithdrawn,
    netDeposits: totalDeposited - totalWithdrawn,
    loading,
    error,
    refresh: async () => {
      await fetchDeposits();
      await fetchWithdrawals();
      await fetchBalance();
    },
    addDeposit,
    deleteDeposit,
    addWithdrawal,
    deleteWithdrawal,
  };
}
