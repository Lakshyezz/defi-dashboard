"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  ArrowLeft,
  Home,
  Activity,
  Settings,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

// Import types from types file
import type {
  CategoryType,
  PoolData,
  HistoricalDataPoint,
  ProcessedDataPoint,
} from "../../types/dashboard";

// Custom Connect Button Component
const CustomConnectButton = () => {
  const {} = useAccount();
  const {} = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    type="button"
                    variant="destructive"
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={openAccountModal}
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

const DeFiDashboard = () => {
  // Use wagmi hook for wallet connection state
  const { address, isConnected } = useAccount();

  // State with proper TypeScript types
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);
  const [historicalData, setHistoricalData] = useState<ProcessedDataPoint[]>(
    []
  );
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // Specific pool IDs from requirements
  const targetPoolIds = useMemo(
    () => [
      "db678df9-3281-4bc2-a8bb-01160ffd6d48", // aave-v3
      "c1ca08e4-d618-415e-ad63-fcec58705469", // compound-v3
      "8edfdf02-cdbb-43f7-bca6-954e5fe56813", // maple
      "747c1d2a-c668-4682-b9f9-296708a3dd90", // lido
      "80b8bf92-b953-4c20-98ea-c9653ef2bb98", // binance-staked-eth
      "90bfb3c2-5d35-4959-a275-ba5085b08aa3", // stader
      "107fb915-ab29-475b-b526-d0ed0d3e6110", // cian-yield-layer
      "05a3d186-2d42-4e21-b1f0-68c079d22677", // yearn-finance
      "1977885c-d5ae-4c9e-b4df-863b7e1578e6", // beefy
    ],
    []
  );

  // Category mapping
  const categoryMapping = useMemo(
    () => ({
      "db678df9-3281-4bc2-a8bb-01160ffd6d48": "Lending" as CategoryType,
      "c1ca08e4-d618-415e-ad63-fcec58705469": "Lending" as CategoryType,
      "8edfdf02-cdbb-43f7-bca6-954e5fe56813": "Lending" as CategoryType,
      "747c1d2a-c668-4682-b9f9-296708a3dd90": "Liquid Staking" as CategoryType,
      "80b8bf92-b953-4c20-98ea-c9653ef2bb98": "Liquid Staking" as CategoryType,
      "90bfb3c2-5d35-4959-a275-ba5085b08aa3": "Liquid Staking" as CategoryType,
      "107fb915-ab29-475b-b526-d0ed0d3e6110":
        "Yield Aggregator" as CategoryType,
      "05a3d186-2d42-4e21-b1f0-68c079d22677":
        "Yield Aggregator" as CategoryType,
      "1977885c-d5ae-4c9e-b4df-863b7e1578e6":
        "Yield Aggregator" as CategoryType,
    }),
    []
  );

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch("https://yields.llama.fi/pools");
        const data = await response.json();

        const filteredPools: PoolData[] = data.data
          .filter((pool: PoolData) => targetPoolIds.includes(pool.pool))
          .map((pool: PoolData) => ({
            ...pool,
            category:
              categoryMapping[pool.pool as keyof typeof categoryMapping],
          }));

        setPools(filteredPools);
      } catch (error) {
        console.error("Error fetching pools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [categoryMapping, targetPoolIds]);

  // Filter pools by category
  const filteredPools =
    selectedCategory === "All"
      ? pools
      : pools.filter((pool) => pool.category === selectedCategory);

  // Format functions
  const formatNumber = (num: number | null | undefined): string => {
    if (!num) return "N/A";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num: number | null | undefined): string =>
    num ? `${num.toFixed(2)}%` : "N/A";

  // Fetch historical data
  const fetchHistoricalData = async (poolId: string): Promise<void> => {
    setChartLoading(true);
    try {
      const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
      const data = await response.json();
      const processedData = processMonthlyData(data.data);
      setHistoricalData(processedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setHistoricalData([]);
    } finally {
      setChartLoading(false);
    }
  };

  // Process monthly data
  const processMonthlyData = (
    rawData: HistoricalDataPoint[]
  ): ProcessedDataPoint[] => {
    if (!rawData || rawData.length === 0) return [];

    const sortedData = rawData.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const monthlyData: ProcessedDataPoint[] = [];
    const monthlyGroups: Record<string, HistoricalDataPoint[]> = {};

    for (const dataPoint of sortedData) {
      const date = new Date(dataPoint.timestamp);
      if (date < twelveMonthsAgo) continue;

      const monthKey = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth()
      ).padStart(2, "0")}`;

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(dataPoint);
    }

    Object.keys(monthlyGroups)
      .sort()
      .forEach((monthKey) => {
        const monthData = monthlyGroups[monthKey];
        const bestPoint =
          monthData.find(
            (point) => new Date(point.timestamp).getUTCDate() === 1
          ) ||
          monthData.find(
            (point) => new Date(point.timestamp).getUTCDate() <= 5
          ) ||
          monthData[0];

        if (bestPoint) {
          const date = new Date(bestPoint.timestamp);
          monthlyData.push({
            date: date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            }),
            timestamp: bestPoint.timestamp,
            apy: bestPoint.apy || 0,
            tvl: bestPoint.tvlUsd || 0,
            actualDay: date.getUTCDate(),
            fullDate: date.toISOString().split("T")[0],
          });
        }
      });

    return monthlyData
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .slice(-12);
  };

  // Handle pool selection
  const handlePoolClick = (pool: PoolData): void => {
    setSelectedPool(pool);
    fetchHistoricalData(pool.pool);
  };

  // Check if pool should be locked (now using wagmi isConnected)
  const isPoolLocked = (pool: PoolData): boolean => {
    return pool.category === "Yield Aggregator" && !isConnected;
  };

  const categories: CategoryType[] = [
    "All",
    "Lending",
    "Liquid Staking",
    "Yield Aggregator",
  ];

  // Pool Detail View Component
  const PoolDetailView = () => {
    if (!selectedPool) return null;

    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedPool(null)}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Current APY"
            value={formatPercent(selectedPool.apy)}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Value Locked"
            value={formatNumber(selectedPool.tvlUsd)}
            icon={DollarSign}
          />
          <StatCard
            title="30-day Avg APY"
            value={formatPercent(selectedPool.apyMean30d)}
            icon={BarChart3}
          />
          <StatCard
            title="Risk Score"
            value={selectedPool.sigma?.toFixed(3) || "N/A"}
            icon={Target}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historical APY - Last 12 Months</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : historicalData.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Showing {historicalData.length} data points from{" "}
                  {historicalData[0]?.fullDate} to{" "}
                  {historicalData[historicalData.length - 1]?.fullDate}
                </div>

                <ChartContainer
                  config={{
                    apy: {
                      label: "APY",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <AreaChart
                    accessibilityLayer
                    data={historicalData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${Number(value).toFixed(4)}%`,
                            "APY",
                          ]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              const data = payload[0].payload;
                              return `${label} (${data.fullDate})`;
                            }
                            return label;
                          }}
                        />
                      }
                    />
                    <defs>
                      <linearGradient id="fillApy" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-apy)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-apy)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="apy"
                      type="natural"
                      fill="url(#fillApy)"
                      fillOpacity={0.4}
                      stroke="var(--color-apy)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No historical data available for this pool
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
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
      {/* Sidebar */}
      <div className="hidden w-64 border-r bg-background p-6 lg:block">
        <div className="space-y-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">DeFi Dashboard</h2>
            <div className="space-y-1">
              <Button variant="secondary" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedPool
                  ? `${selectedPool.project} - ${selectedPool.symbol}`
                  : "DeFi Pools"}
              </h1>
              <p className="text-muted-foreground">
                {selectedPool
                  ? selectedPool.category
                  : "Explore lending, liquid staking, and yield aggregator pools"}
              </p>
            </div>

            {/* Clean Custom Connect Button */}
            <div className="flex items-center gap-4">
              {address && (
                <div className="text-sm text-muted-foreground">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
              <CustomConnectButton />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {selectedPool ? (
            <PoolDetailView />
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
                {categories.map((category) => (
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

              {/* Pools Table */}
              <Card>
                <CardHeader>
                  <CardTitle>DeFi Pools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Project
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Category
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Symbol
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Current APY
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            TVL
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            30d Avg APY
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Risk
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredPools.map((pool) => {
                          const locked = isPoolLocked(pool);
                          return (
                            <tr
                              key={pool.pool}
                              className={`border-b transition-colors hover:bg-muted/50 ${
                                locked ? "opacity-50" : "cursor-pointer"
                              }`}
                              onClick={() => !locked && handlePoolClick(pool)}
                            >
                              <td className="p-4 align-middle font-medium">
                                {pool.project}
                                {locked && (
                                  <Lock className="inline ml-2 h-3 w-3" />
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                <span className="text-sm font-medium">
                                  {pool.category}
                                </span>
                              </td>
                              <td className="p-4 align-middle">
                                {pool.symbol}
                              </td>
                              <td className="p-4 align-middle font-medium">
                                {formatPercent(pool.apy)}
                              </td>
                              <td className="p-4 align-middle">
                                {formatNumber(pool.tvlUsd)}
                              </td>
                              <td className="p-4 align-middle">
                                {formatPercent(pool.apyMean30d)}
                              </td>
                              <td className="p-4 align-middle">
                                {pool.sigma && (
                                  <span className="text-sm font-medium">
                                    {pool.sigma.toFixed(3)}
                                  </span>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                {locked ? (
                                  <Badge variant="destructive">Locked</Badge>
                                ) : (
                                  <span className="text-sm font-medium">
                                    Available
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeFiDashboard;
