"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Activity, Settings } from "lucide-react";

const Sidebar = () => {
  return (
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
  );
};

export default Sidebar;