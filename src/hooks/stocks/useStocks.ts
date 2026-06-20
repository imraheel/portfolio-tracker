import { useState, useEffect, useCallback } from 'react';
import * as stocksService from '@/services/stocks/stocks';
import type { Stock, StockPrice } from '@/services/stocks/stocks';

export function useStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [prices, setPrices] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stocksService.getStocks();
      setStocks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    try {
      const data = await stocksService.getStockPrices();
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    }
  }, []);

  const addStock = useCallback(async (data: { symbol: string; companyName?: string; sector?: string }) => {
    const result = await stocksService.addStock(data);
    if (result.success) {
      await fetchStocks();
    }
    return result;
  }, [fetchStocks]);

  const updatePrice = useCallback(async (data: { symbol: string; currentPrice: number }) => {
    const result = await stocksService.updateStockPrice(data);
    if (result.success) {
      await fetchPrices();
    }
    return result;
  }, [fetchPrices]);

  useEffect(() => {
    fetchStocks();
    fetchPrices();
  }, [fetchStocks, fetchPrices]);

  const priceMap = new Map(prices.map(p => [p.symbol, p.current_price]));

  return {
    stocks,
    prices,
    priceMap,
    loading,
    error,
    refresh: async () => {
      await fetchStocks();
      await fetchPrices();
    },
    addStock,
    updatePrice,
  };
}
