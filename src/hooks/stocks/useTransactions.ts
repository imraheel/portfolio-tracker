import { useState, useEffect, useCallback } from 'react';
import * as transactionsService from '@/services/stocks/transactions';
import type { BuyTransaction, SellTransaction, Dividend } from '@/services/stocks/transactions';

export function useTransactions() {
  const [buyTransactions, setBuyTransactions] = useState<BuyTransaction[]>([]);
  const [sellTransactions, setSellTransactions] = useState<SellTransaction[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuyTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getBuyTransactions();
      setBuyTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch buy transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSellTransactions = useCallback(async () => {
    try {
      const data = await transactionsService.getSellTransactions();
      setSellTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sell transactions');
    }
  }, []);

  const fetchDividends = useCallback(async () => {
    try {
      const data = await transactionsService.getDividends();
      setDividends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dividends');
    }
  }, []);

  const addBuyTransaction = useCallback(async (data: { 
    stockId: number; 
    quantity: number; 
    buyRate: number; 
    buyDate: Date; 
    notes?: string 
  }) => {
    const result = await transactionsService.addBuyTransaction(data);
    if (result.success) {
      await fetchBuyTransactions();
    }
    return result;
  }, [fetchBuyTransactions]);

  const addSellTransaction = useCallback(async (data: { 
    stockId: number; 
    quantity: number; 
    sellRate: number; 
    sellDate: Date; 
    notes?: string 
  }) => {
    const result = await transactionsService.addSellTransaction(data);
    if (result.success) {
      await fetchSellTransactions();
    }
    return result;
  }, [fetchSellTransactions]);

  const addDividend = useCallback(async (data: { 
    stockId: number; 
    dividendAmount: number; 
    dividendDate: Date; 
    notes?: string 
  }) => {
    const result = await transactionsService.addDividend(data);
    if (result.success) {
      await fetchDividends();
    }
    return result;
  }, [fetchDividends]);

  useEffect(() => {
    fetchBuyTransactions();
    fetchSellTransactions();
    fetchDividends();
  }, [fetchBuyTransactions, fetchSellTransactions, fetchDividends]);

  return {
    buyTransactions,
    sellTransactions,
    dividends,
    loading,
    error,
    refresh: async () => {
      await fetchBuyTransactions();
      await fetchSellTransactions();
      await fetchDividends();
    },
    addBuyTransaction,
    addSellTransaction,
    addDividend,
  };
}
