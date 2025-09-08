"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { formatNumber, formatPercent } from "../utils/formatters";
import type { PoolData } from "../types/dashboard";

interface PoolsTableProps {
  pools: PoolData[];
  onPoolClick: (pool: PoolData) => void;
  isPoolLocked: (pool: PoolData) => boolean;
}

const PoolsTable: React.FC<PoolsTableProps> = ({
  pools,
  onPoolClick,
  isPoolLocked,
}) => {
  return (
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
              {pools.map((pool) => {
                const locked = isPoolLocked(pool);
                return (
                  <tr
                    key={pool.pool}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      locked ? "opacity-50" : "cursor-pointer"
                    }`}
                    onClick={() => !locked && onPoolClick(pool)}
                  >
                    <td className="p-4 align-middle font-medium">
                      {pool.project}
                      {locked && <Lock className="inline ml-2 h-3 w-3" />}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="text-sm font-medium">
                        {pool.category}
                      </span>
                    </td>
                    <td className="p-4 align-middle">{pool.symbol}</td>
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
                        <span className="text-sm font-medium">Available</span>
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
  );
};

export default PoolsTable;