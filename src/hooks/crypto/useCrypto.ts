import { useState, useEffect, useCallback } from 'react';
import * as cryptoService from '@/services/crypto/crypto';
import type {
  Cryptocurrency,
  CryptoPurchase,
  CryptoWithdrawal,
  CryptoMetrics,
} from '@/services/crypto/crypto';

export function useCrypto() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [purchases, setPurchases] = useState<CryptoPurchase[]>([]);
  const [withdrawals, setWithdrawals] = useState<CryptoWithdrawal[]>([]);
  const [metrics, setMetrics] = useState<CryptoMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptocurrencies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cryptoService.getCryptocurrencies();
      setCryptocurrencies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrencies');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      const data = await cryptoService.getPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchases');
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const data = await cryptoService.getWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await cryptoService.getAllCryptoMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  }, []);

  const addCryptocurrency = useCallback(
    async (data: { symbol: string; name: string }) => {
      const result = await cryptoService.addCryptocurrency(data);
      if (result.success) {
        await fetchCryptocurrencies();
      }
      return result;
    },
    [fetchCryptocurrencies]
  );

  const updateTotalValue = useCallback(
    async (data: { cryptoId: number; totalValue: number }) => {
      const result = await cryptoService.updateTotalValue(data);
      if (result.success) {
        await fetchCryptocurrencies();
        await fetchMetrics();
      }
      return result;
    },
    [fetchCryptocurrencies, fetchMetrics]
  );

  const addPurchase = useCallback(
    async (data: { cryptoId: number; amountPkr: number; purchaseDate: Date; notes?: string }) => {
      const result = await cryptoService.addPurchase(data);
      if (result.success) {
        await fetchPurchases();
        await fetchMetrics();
      }
      return result;
    },
    [fetchPurchases, fetchMetrics]
  );

  const addWithdrawal = useCallback(
    async (data: { cryptoId: number; amountPkr: number; withdrawalDate: Date; notes?: string }) => {
      const result = await cryptoService.addWithdrawal(data);
      if (result.success) {
        await fetchWithdrawals();
        await fetchMetrics();
      }
      return result;
    },
    [fetchWithdrawals, fetchMetrics]
  );

  const refresh = useCallback(async () => {
    await fetchCryptocurrencies();
    await fetchPurchases();
    await fetchWithdrawals();
    await fetchMetrics();
  }, [fetchCryptocurrencies, fetchPurchases, fetchWithdrawals, fetchMetrics]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    cryptocurrencies,
    purchases,
    withdrawals,
    metrics,
    loading,
    error,
    refresh,
    addCryptocurrency,
    updateTotalValue,
    addPurchase,
    addWithdrawal,
  };
}
