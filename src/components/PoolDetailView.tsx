"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { PoolData, ProcessedDataPoint } from "../types/dashboard";

interface PoolDetailViewProps {
  selectedPool: PoolData | null;
  historicalData: ProcessedDataPoint[];
  chartLoading: boolean;
  onBackClick: () => void;
}

const PoolDetailView: React.FC<PoolDetailViewProps> = ({
  selectedPool,
  historicalData,
  chartLoading,
  onBackClick,
}) => {
  if (!selectedPool) return null;

  const formatNumber = (num: number | null | undefined): string => {
    if (!num) return "N/A";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num: number | null | undefined): string =>
    num ? `${num.toFixed(2)}%` : "N/A";

  return (
    <div className="space-y-6">
      <Button onClick={onBackClick} variant="outline" size="sm">
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

export default PoolDetailView;