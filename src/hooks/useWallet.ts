import { useState, useEffect, useCallback } from 'react';
import * as walletService from '@/services/wallet';
import type { Deposit } from '@/services/wallet';

export function useWallet() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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

  const deleteDeposit = useCallback(async (id: number) => {
    const result = await walletService.deleteDeposit(id);
    if (result.success) {
      await fetchDeposits();
      await fetchBalance();
    }
    return result;
  }, [fetchDeposits, fetchBalance]);

  useEffect(() => {
    fetchDeposits();
    fetchBalance();
  }, [fetchDeposits, fetchBalance]);

  return {
    deposits,
    balance,
    totalDeposited: deposits.reduce((sum, d) => sum + d.amount, 0),
    loading,
    error,
    refresh: async () => {
      await fetchDeposits();
      await fetchBalance();
    },
    addDeposit,
    deleteDeposit,
  };
}
