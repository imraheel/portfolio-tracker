/**
 * Service for fetching live stock prices from PSX (Pakistan Stock Exchange)
 * via Electron IPC (main process scrapes https://dps.psx.com.pk)
 */

export interface LivePrice {
  symbol: string;
  name: string | null;
  price: number;
}

export interface LivePriceResult {
  success: boolean;
  data?: LivePrice;
  message?: string;
}

/**
 * Check if we're running inside Electron (psx API available)
 */
function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.psx !== 'undefined';
}

/**
 * Fetch a single live stock price from PSX
 */
export async function fetchLivePrice(symbol: string): Promise<LivePriceResult> {
  if (!isElectron()) {
    return { success: false, message: 'PSX scraping only available in Electron app' };
  }

  try {
    const result = await window.psx.getPrice(symbol);

    if (result.success && result.price !== undefined) {
      return {
        success: true,
        data: {
          symbol: result.symbol!,
          name: result.name ?? null,
          price: result.price,
        },
      };
    }

    return { success: false, message: result.message || 'Failed to fetch price' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Fetch live stock prices for multiple symbols from PSX
 */
export async function fetchLivePrices(symbols: string[]): Promise<Map<string, LivePrice>> {
  const map = new Map<string, LivePrice>();

  if (!isElectron() || symbols.length === 0) {
    return map;
  }

  try {
    const results = await window.psx.getPrices(symbols);

    for (const result of results) {
      if (result.success && result.price !== undefined) {
        map.set(result.symbol!, {
          symbol: result.symbol!,
          name: result.name ?? null,
          price: result.price,
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch live prices:', error);
  }

  return map;
}
