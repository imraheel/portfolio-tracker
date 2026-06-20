import { useState, useEffect, useCallback } from 'react';
import * as mutualFundsService from '@/services/mutualFunds/mutualFunds';
import type {
  MutualFund,
  MutualFundPurchase,
  MutualFundWithdrawal,
  FundMetrics,
} from '@/services/mutualFunds/mutualFunds';

export function useMutualFunds() {
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [purchases, setPurchases] = useState<MutualFundPurchase[]>([]);
  const [withdrawals, setWithdrawals] = useState<MutualFundWithdrawal[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mutualFundsService.getMutualFunds();
      setFunds(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mutual funds');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      const data = await mutualFundsService.getPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchases');
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const data = await mutualFundsService.getWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await mutualFundsService.getAllFundMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  }, []);

  const addFund = useCallback(
    async (data: { symbol: string; name: string; description?: string }) => {
      const result = await mutualFundsService.addMutualFund(data);
      if (result.success) {
        await fetchFunds();
      }
      return result;
    },
    [fetchFunds]
  );

  const updateMarketValue = useCallback(
    async (data: { symbol: string; currentValue: number }) => {
      const result = await mutualFundsService.updateMarketValue(data);
      if (result.success) {
        await fetchFunds();
        await fetchMetrics();
      }
      return result;
    },
    [fetchFunds, fetchMetrics]
  );

  const addPurchase = useCallback(
    async (data: { symbol: string; amount: number; purchaseDate: Date; notes?: string }) => {
      const result = await mutualFundsService.addPurchase(data);
      if (result.success) {
        await fetchPurchases();
        await fetchMetrics();
      }
      return result;
    },
    [fetchPurchases, fetchMetrics]
  );

  const addWithdrawal = useCallback(
    async (data: { symbol: string; amount: number; withdrawalDate: Date; notes?: string }) => {
      const result = await mutualFundsService.addWithdrawal(data);
      if (result.success) {
        await fetchWithdrawals();
        await fetchMetrics();
      }
      return result;
    },
    [fetchWithdrawals, fetchMetrics]
  );

  const refresh = useCallback(async () => {
    await fetchFunds();
    await fetchPurchases();
    await fetchWithdrawals();
    await fetchMetrics();
  }, [fetchFunds, fetchPurchases, fetchWithdrawals, fetchMetrics]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    funds,
    purchases,
    withdrawals,
    metrics,
    loading,
    error,
    refresh,
    addFund,
    updateMarketValue,
    addPurchase,
    addWithdrawal,
  };
}
