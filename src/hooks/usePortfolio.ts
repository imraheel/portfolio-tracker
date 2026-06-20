import { useState, useEffect, useCallback } from 'react';
import * as portfolioService from '@/services/portfolio';
import type { HoldingMetric } from '@/services/portfolio';

export function usePortfolio() {
  const [metrics, setMetrics] = useState<HoldingMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolioMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const portfolioValue = metrics.reduce((sum, m) => sum + m.currentValue, 0);
  const unrealizedPl = metrics.reduce((sum, m) => sum + m.unrealizedGainLoss, 0);
  const realizedPl = metrics.reduce((sum, m) => sum + m.realizedGainLoss, 0);
  const totalDividends = metrics.reduce((sum, m) => sum + m.totalDividends, 0);
  const totalInvested = metrics.reduce((sum, m) => sum + m.investedAmount, 0);

  const holdingsMap = new Map<string, number>(
    metrics.map(m => [m.symbol, m.remainingQty])
  );

  return {
    metrics,
    portfolioValue,
    unrealizedPl,
    realizedPl,
    totalDividends,
    totalInvested,
    holdingsMap,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
