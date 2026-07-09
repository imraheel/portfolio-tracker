import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stocksService from '@/services/stocks/stocks';
import { queryKeys } from '@/lib/queryKeys';

export function useStocks() {
  const queryClient = useQueryClient();

  const stocksQuery = useQuery({
    queryKey: queryKeys.stocks.list(),
    queryFn: stocksService.getStocks,
    staleTime: 10 * 60 * 1000,
  });

  const pricesQuery = useQuery({
    queryKey: queryKeys.stocks.prices(),
    queryFn: stocksService.getStockPrices,
    staleTime: 2 * 60 * 1000,
  });

  const addStockMutation = useMutation({
    mutationFn: stocksService.addStock,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stocks.list() });
      }
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: stocksService.updateStockPrice,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.stocks.prices() });
      }
    },
  });

  const priceMap = useMemo(
    () => new Map((pricesQuery.data ?? []).map(p => [p.symbol, p.current_price])),
    [pricesQuery.data]
  );

  return {
    stocks: stocksQuery.data ?? [],
    prices: pricesQuery.data ?? [],
    priceMap,
    loading: stocksQuery.isLoading || pricesQuery.isLoading,
    error: stocksQuery.error ?? pricesQuery.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all }),
    addStock: addStockMutation.mutateAsync,
    updatePrice: updatePriceMutation.mutateAsync,
  };
}
