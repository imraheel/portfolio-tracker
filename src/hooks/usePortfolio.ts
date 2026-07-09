import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as portfolioService from '@/services/portfolio';
import { queryKeys } from '@/lib/queryKeys';

export function usePortfolio() {
  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: queryKeys.portfolio.metrics(),
    queryFn: portfolioService.getPortfolioMetrics,
    staleTime: 2 * 60 * 1000,
  });

  const metrics = metricsQuery.data ?? [];

  const portfolioValue = useMemo(() => metrics.reduce((sum, m) => sum + m.currentValue, 0), [metrics]);
  const unrealizedPl = useMemo(() => metrics.reduce((sum, m) => sum + m.unrealizedGainLoss, 0), [metrics]);
  const realizedPl = useMemo(() => metrics.reduce((sum, m) => sum + m.realizedGainLoss, 0), [metrics]);
  const totalDividends = useMemo(() => metrics.reduce((sum, m) => sum + m.totalDividends, 0), [metrics]);
  const totalInvested = useMemo(() => metrics.reduce((sum, m) => sum + m.investedAmount, 0), [metrics]);

  const holdingsMap = useMemo(
    () => new Map<string, number>(metrics.map(m => [m.symbol, m.remainingQty])),
    [metrics]
  );

  return {
    metrics,
    portfolioValue,
    unrealizedPl,
    realizedPl,
    totalDividends,
    totalInvested,
    holdingsMap,
    loading: metricsQuery.isLoading,
    error: metricsQuery.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.metrics() }),
  };
}
