import { useState } from "react";
import { poolsApi } from "../services/poolsApi";
import { processMonthlyData } from "../utils/dataProcessor";
import type { ProcessedDataPoint } from "../types/dashboard";

export const useHistoricalData = () => {
  const [historicalData, setHistoricalData] = useState<ProcessedDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  const fetchHistoricalData = async (poolId: string): Promise<void> => {
    setChartLoading(true);
    try {
      const rawData = await poolsApi.fetchHistoricalData(poolId);
      const processedData = processMonthlyData(rawData);
      setHistoricalData(processedData);
    } catch (error) {
      console.error("Failed to fetch historical data:", error);
      setHistoricalData([]);
    } finally {
      setChartLoading(false);
    }
  };

  return { 
    historicalData, 
    chartLoading, 
    fetchHistoricalData 
  };
};