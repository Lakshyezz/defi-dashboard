"use client";
import React from "react";
import { useAccount } from "wagmi";
import CustomConnectButton from "../CustomConnectButton";
import type { PoolData } from "../../types/dashboard";

interface HeaderProps {
  selectedPool: PoolData | null;
}

const Header: React.FC<HeaderProps> = ({ selectedPool }) => {
  const { address } = useAccount();

  return (
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
  );
};

export default Header;