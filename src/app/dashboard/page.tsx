"use client";
import React, { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Lock,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { useAccount } from "wagmi";

// Import types
import type {
  CategoryType,
  PoolData,
} from "../../types/dashboard";

// Import components
import PoolDetailView from "@/components/PoolDetailView";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PoolsTable from "@/components/PoolsTable";

// Import hooks
import { usePoolData } from "../../hooks/usePoolData";
import { useHistoricalData } from "../../hooks/useHistoricalData";

// Import config
import { CATEGORIES } from "../../config/pools";

// Import utils
import { formatNumber, formatPercent } from "../../utils/formatters";

const DeFiDashboard = () => {
  // Use wagmi hook for wallet connection state
  const { address, isConnected } = useAccount();

  // Use custom hooks
  const { pools, loading } = usePoolData();
  const { historicalData, chartLoading, fetchHistoricalData } = useHistoricalData();

  // State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);

  // Filter pools by category
  const filteredPools =
    selectedCategory === "All"
      ? pools
      : pools.filter((pool) => pool.category === selectedCategory);

  // Handle pool selection
  const handlePoolClick = (pool: PoolData): void => {
    setSelectedPool(pool);
    fetchHistoricalData(pool.pool);
  };

  // Check if pool should be locked (now using wagmi isConnected)
  const isPoolLocked = (pool: PoolData): boolean => {
    return pool.category === "Yield Aggregator" && !isConnected;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedPool={selectedPool} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {selectedPool ? (
            <PoolDetailView
              selectedPool={selectedPool}
              historicalData={historicalData}
              chartLoading={chartLoading}
              onBackClick={() => setSelectedPool(null)}
            />
          ) : (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Pools"
                  value={pools.length}
                  icon={BarChart3}
                />
                <StatCard
                  title="Total TVL"
                  value={formatNumber(
                    pools.reduce((sum, pool) => sum + (pool.tvlUsd || 0), 0)
                  )}
                  icon={DollarSign}
                />
                <StatCard
                  title="Average APY"
                  value={formatPercent(
                    pools.reduce((sum, pool) => sum + (pool.apy || 0), 0) /
                      pools.length
                  )}
                  icon={TrendingUp}
                />
                <StatCard
                  title="Wallet Status"
                  value={isConnected ? "Connected" : "Disconnected"}
                  icon={Lock}
                  subtitle={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined}
                />
              </div>

              {/* Category Filters */}
              <div className="flex space-x-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <PoolsTable
                pools={filteredPools}
                onPoolClick={handlePoolClick}
                isPoolLocked={isPoolLocked}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeFiDashboard;