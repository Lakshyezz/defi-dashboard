import { useState, useEffect } from "react";
import { poolsApi } from "../services/poolsApi";
import { TARGET_POOL_IDS, CATEGORY_MAPPING } from "../config/pools";
import type { PoolData } from "../types/dashboard";

export const usePoolData = () => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const data = await poolsApi.fetchPools();

        const filteredPools: PoolData[] = data
          .filter((pool: PoolData) => TARGET_POOL_IDS.includes(pool.pool))
          .map((pool: PoolData) => ({
            ...pool,
            category: CATEGORY_MAPPING[pool.pool] || "Unknown",
          }));

        setPools(filteredPools);
      } catch (error) {
        console.error("Failed to fetch pools:", error);
        setPools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  return { pools, loading };
};