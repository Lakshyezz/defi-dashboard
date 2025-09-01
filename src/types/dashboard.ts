// types.ts - TypeScript type definitions for DeFi Dashboard

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}

// Category types
export type CategoryType = 'All' | 'Lending' | 'Liquid Staking' | 'Yield Aggregator';

// API Response interfaces
export interface Predictions {
  predictedClass: string;
  predictedProbability: number;
  binnedConfidence: number;
}

export interface PoolData {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: number;
  apyPct7D: number;
  apyPct30D: number;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: Predictions | null;
  poolMeta: string | null;
  mu: number;
  sigma: number;
  count: number;
  outlier: boolean;
  underlyingTokens: string[] | null;
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
  category: CategoryType; // Added field for our categorization
}

export interface HistoricalDataPoint {
  timestamp: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number | null;
  il7d: number | null;
  apyBase7d: number | null;
}

export interface ProcessedDataPoint {
  date: string;
  timestamp: string;
  apy: number;
  tvl: number;
  actualDay: number;
  fullDate: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

// API Response wrappers
export interface PoolsApiResponse {
  status: string;
  data: PoolData[];
}

export interface HistoricalApiResponse {
  status: string;
  data: HistoricalDataPoint[];
}