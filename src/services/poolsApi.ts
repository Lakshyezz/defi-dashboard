import type { HistoricalDataPoint, PoolData } from "../types/dashboard";

const API_BASE_URL = "https://yields.llama.fi";

export const poolsApi = {
  async fetchPools(): Promise<PoolData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/pools`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching pools:", error);
      throw new Error("Failed to fetch pools data");
    }
  },

  async fetchHistoricalData(poolId: string): Promise<HistoricalDataPoint[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chart/${poolId}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw new Error("Failed to fetch historical data");
    }
  },
};