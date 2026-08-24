/// <reference types="vite/client" />

interface PsxPriceResult {
  success: boolean;
  symbol?: string;
  name?: string | null;
  price?: number;
  message?: string;
}

interface PsxAPI {
  getPrice: (symbol: string) => Promise<PsxPriceResult>;
  getPrices: (symbols: string[]) => Promise<PsxPriceResult[]>;
}

interface ElectronAPI {
  platform: string;
}

declare global {
  interface Window {
    psx: PsxAPI;
    electronAPI: ElectronAPI;
  }
}

export {};
