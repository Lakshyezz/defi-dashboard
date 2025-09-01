"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Lock, TrendingUp, DollarSign, Target, BarChart3, ArrowLeft, Calendar, X, User, Key } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryType, LoginForm, PoolData, ProcessedDataPoint } from '@/types/dashboard';

interface ApiPoolData {
  pool: string;
  category?: CategoryType;
  project?: string;
  symbol?: string;
  tvlUsd?: number;
  apy?: number;
  apyMean30d?: number;
  sigma?: number;
  predictions?: {
    predictedClass: string;
    predictedProbability: number;
  } | null;
}

interface HistoricalApiData {
  timestamp: string;
  apy?: number;
  tvlUsd?: number;
}

const DeFiDashboard = () => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);
  const [historicalData, setHistoricalData] = useState<ProcessedDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string>('');

  // Specific pool IDs from requirements - wrapped in useMemo to prevent useEffect re-runs
  const targetPoolIds = useMemo(() => [
    // Lending
    'db678df9-3281-4bc2-a8bb-01160ffd6d48', // aave-v3
    'c1ca08e4-d618-415e-ad63-fcec58705469', // compound-v3
    '8edfdf02-cdbb-43f7-bca6-954e5fe56813', // maple
    // Liquid Staking
    '747c1d2a-c668-4682-b9f9-296708a3dd90', // lido
    '80b8bf92-b953-4c20-98ea-c9653ef2bb98', // binance-staked-eth
    '90bfb3c2-5d35-4959-a275-ba5085b08aa3', // stader
    // Yield Aggregator
    '107fb915-ab29-475b-b526-d0ed0d3e6110', // cian-yield-layer
    '05a3d186-2d42-4e21-b1f0-68c079d22677', // yearn-finance
    '1977885c-d5ae-4c9e-b4df-863b7e1578e6', // beefy
  ], []);

  // Category mapping based on requirements - wrapped in useMemo to prevent useEffect re-runs
  const categoryMapping: Record<string, CategoryType> = useMemo(() => ({
    'db678df9-3281-4bc2-a8bb-01160ffd6d48': 'Lending',
    'c1ca08e4-d618-415e-ad63-fcec58705469': 'Lending',
    '8edfdf02-cdbb-43f7-bca6-954e5fe56813': 'Lending',
    '747c1d2a-c668-4682-b9f9-296708a3dd90': 'Liquid Staking',
    '80b8bf92-b953-4c20-98ea-c9653ef2bb98': 'Liquid Staking',
    '90bfb3c2-5d35-4959-a275-ba5085b08aa3': 'Liquid Staking',
    '107fb915-ab29-475b-b526-d0ed0d3e6110': 'Yield Aggregator',
    '05a3d186-2d42-4e21-b1f0-68c079d22677': 'Yield Aggregator',
    '1977885c-d5ae-4c9e-b4df-863b7e1578e6': 'Yield Aggregator',
  }), []);

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch('https://yields.llama.fi/pools');
        const data = await response.json();
        
        // Filter only our target pools and add categories
        const filteredPools: PoolData[] = data.data
          .filter((pool: ApiPoolData) => targetPoolIds.includes(pool.pool))
          .map((pool: ApiPoolData) => ({
            ...pool,
            category: categoryMapping[pool.pool]
          }));
        
        setPools(filteredPools);
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [targetPoolIds, categoryMapping]);

  // Filter pools by category
  const filteredPools = selectedCategory === 'All' 
    ? pools 
    : pools.filter(pool => pool.category === selectedCategory);

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num?.toFixed(2)}`;
  };

  const formatPercent = (num: number) => `${num?.toFixed(2)}%`;

  // Fetch historical data for a specific pool
  const fetchHistoricalData = async (poolId: string) => {
    setChartLoading(true);
    try {
      const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
      const data = await response.json();
      
      // Process data to get 1st day of each month for last 12 months
      const processedData = processMonthlyData(data.data);
      setHistoricalData(processedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setHistoricalData([]);
    } finally {
      setChartLoading(false);
    }
  };

  // Process data to extract 1st day of each month (or closest available)
  const processMonthlyData = (rawData: HistoricalApiData[]) => {
    if (!rawData || rawData.length === 0) return [];
    
    // Sort data by timestamp
    const sortedData = rawData.sort((a: HistoricalApiData, b: HistoricalApiData) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Get last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    
    const monthlyData: ProcessedDataPoint[] = [];
    
    // Group data by month and find best representative for each month
    const monthlyGroups: { [key: string]: HistoricalApiData[] } = {};
    
    for (const dataPoint of sortedData) {
      const date = new Date(dataPoint.timestamp);
      if (date < twelveMonthsAgo) continue;
      
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth()).padStart(2, '0')}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = [];
      }
      monthlyGroups[monthKey].push(dataPoint);
    }
    
    // For each month, find the data point closest to the 1st day
    Object.keys(monthlyGroups).sort().forEach(monthKey => {
      const monthData = monthlyGroups[monthKey];
      
      // Try to find exact 1st day first
      let bestPoint = monthData.find(point => {
        const date = new Date(point.timestamp);
        return date.getUTCDate() === 1;
      });
      
      // If no exact 1st day, find closest to 1st day (within first 5 days)
      if (!bestPoint) {
        bestPoint = monthData.find(point => {
          const date = new Date(point.timestamp);
          return date.getUTCDate() <= 5; // Within first 5 days
        });
      }
      
      // Fallback to first available data point in the month
      if (!bestPoint) {
        bestPoint = monthData[0];
      }
      
      if (bestPoint) {
        const date = new Date(bestPoint.timestamp);
        monthlyData.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric',
            timeZone: 'UTC' 
          }),
          timestamp: bestPoint.timestamp,
          apy: bestPoint.apy || 0,
          tvl: bestPoint.tvlUsd || 0,
          actualDay: date.getUTCDate(), // For debugging
          fullDate: date.toISOString().split('T')[0]
        });
      }
    });
    
    console.log('📊 Monthly data with actual days:', monthlyData.map(d => ({
      date: d.date,
      fullDate: d.fullDate,
      actualDay: d.actualDay,
      apy: d.apy
    })));
    
    // Return exactly 12 months, sorted chronologically
    const sortedMonthlyData = monthlyData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const last12Months = sortedMonthlyData.slice(-12);
    
    console.log('🎯 Final 12 months for chart:', last12Months.map(d => ({
      date: d.date,
      fullDate: d.fullDate,
      apy: d.apy
    })));
    
    return last12Months;
  };

  // Handle pool selection
  const handlePoolClick = (pool: PoolData) => {
    setSelectedPool(pool);
    fetchHistoricalData(pool.pool);
  };

  // Connect wallet function with proper login flow
  const connectWallet = async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        // If user rejects MetaMask, show login modal as alternative
        setShowLoginModal(true);
      }
    } else {
      // No MetaMask available, show login modal
      setShowLoginModal(true);
    }
  };

  // Handle mock login
  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    setLoginError('');
    
    // Check credentials
    if (loginForm.username === 'ArcticFox' && loginForm.password === 'arcticfox24') {
      setIsWalletConnected(true);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid credentials. Please check username and password.');
    }
  };

  // Close login modal
  const closeLoginModal = (): void => {
    setShowLoginModal(false);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
  };

  // Check if pool should be locked
  const isPoolLocked = (pool: PoolData): boolean => {
    return pool.category === 'Yield Aggregator' && !isWalletConnected;
  };

  const categories: CategoryType[] = ['All', 'Lending', 'Liquid Staking', 'Yield Aggregator'];

  // Pool Detail View Component
  const PoolDetailView = () => {
    if (!selectedPool) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          onClick={() => setSelectedPool(null)}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Pool Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold capitalize mb-2">{selectedPool.project}</h1>
                <p className="text-xl text-blue-100 mb-4">{selectedPool.symbol}</p>
                <Badge className="bg-white text-blue-600 font-semibold">
                  {selectedPool.category}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Current APY</p>
                <p className="text-4xl font-bold">
                  {selectedPool.apy ? formatPercent(selectedPool.apy) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pool Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">Total Value Locked</p>
              <p className="text-2xl font-bold text-slate-900">
                {selectedPool.tvlUsd ? formatNumber(selectedPool.tvlUsd) : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">30-day Avg APY</p>
              <p className="text-2xl font-bold text-slate-900">
                {selectedPool.apyMean30d ? formatPercent(selectedPool.apyMean30d) : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">Prediction</p>
              <p className="text-lg font-bold text-slate-900">
                {selectedPool.predictions?.predictedClass || 'N/A'}
              </p>
              <p className="text-sm text-slate-500">
                {selectedPool.predictions?.predictedProbability}% confidence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 mb-1">Risk Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {selectedPool.sigma ? selectedPool.sigma.toFixed(3) : 'N/A'}
              </p>
              <Badge 
                variant={selectedPool.sigma < 0.05 ? 'secondary' : 
                        selectedPool.sigma < 0.15 ? 'default' : 'destructive'}
                className="mt-2"
              >
                {selectedPool.sigma < 0.05 ? 'Low Risk' : 
                 selectedPool.sigma < 0.15 ? 'Medium Risk' : 'High Risk'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Historical APY Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical APY - Last 12 Months
            </CardTitle>
            <p className="text-slate-600">APY values from the 1st day of each month</p>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-slate-600">Loading chart data...</p>
              </div>
            ) : historicalData.length > 0 ? (
              <div className="space-y-4">
                {/* Chart Info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📈 Showing {historicalData.length} data points 
                    from {historicalData[0]?.fullDate} to {historicalData[historicalData.length - 1]?.fullDate}
                  </p>
                </div>
                
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        fontSize={12}
                        tickMargin={8}
                        interval="preserveStartEnd"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                        domain={['dataMin', 'dataMax']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => [`${Number(value).toFixed(4)}%`, 'APY']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return `${label} (${data.fullDate})`;
                          }
                          return label;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="apy" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No historical data available for this pool</p>
                  <p className="text-sm text-slate-400 mt-2">This pool might be too new or data might be limited</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading DeFi pools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Show Pool Detail View or Dashboard */}
        {selectedPool ? (
          <PoolDetailView />
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">DeFi Dashboard</h1>
                <p className="text-slate-600">Explore lending, liquid staking, and yield aggregator pools</p>
              </div>
              
              {/* Wallet Connection */}
              <Button 
                onClick={connectWallet}
                className={`${isWalletConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isWalletConnected ? '✅ Wallet Connected' : '🔗 Connect Wallet'}
              </Button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm border">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Pools</p>
                      <p className="text-3xl font-bold">{pools.length}</p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total TVL</p>
                      <p className="text-3xl font-bold">
                        {formatNumber(pools.reduce((sum, pool) => sum + (pool.tvlUsd || 0), 0))}
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Avg APY</p>
                      <p className="text-3xl font-bold">
                        {formatPercent(pools.reduce((sum, pool) => sum + (pool.apy || 0), 0) / pools.length)}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPools.map((pool) => {
                const locked = isPoolLocked(pool);
                
                return (
                  <Card 
                    key={pool.pool} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg relative ${
                      locked ? 'opacity-60 bg-slate-100' : 'hover:shadow-xl hover:-translate-y-1'
                    }`}
                    onClick={() => !locked && handlePoolClick(pool)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold capitalize flex items-center gap-2">
                            {pool.project}
                            {locked && <Lock className="h-4 w-4 text-slate-400" />}
                          </CardTitle>
                          <p className="text-slate-600 font-medium">{pool.symbol}</p>
                        </div>
                        <Badge 
                          variant={pool.category === 'Lending' ? 'default' : 
                                  pool.category === 'Liquid Staking' ? 'secondary' : 'destructive'}
                          className={locked ? 'opacity-50' : ''}
                        >
                          {pool.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* APY - Main metric */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Current APY</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {pool.apy ? formatPercent(pool.apy) : 'N/A'}
                        </p>
                      </div>

                      {/* TVL */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Total Value Locked</span>
                        <span className="font-semibold text-slate-900">
                          {pool.tvlUsd ? formatNumber(pool.tvlUsd) : 'N/A'}
                        </span>
                      </div>

                      {/* 30-day Average APY */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">30-day Avg APY</span>
                        <span className="font-semibold text-slate-900">
                          {pool.apyMean30d ? formatPercent(pool.apyMean30d) : 'N/A'}
                        </span>
                      </div>

                      {/* Risk Score (Sigma) */}
                      {pool.sigma && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">Risk Score</span>
                          <Badge 
                            variant={pool.sigma < 0.05 ? 'secondary' : 
                                    pool.sigma < 0.15 ? 'default' : 'destructive'}
                          >
                            {pool.sigma.toFixed(3)}
                          </Badge>
                        </div>
                      )}

                      {/* Predictions */}
                      {pool.predictions && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">Prediction</span>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-700">
                              {pool.predictions.predictedClass}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({pool.predictions.predictedProbability}%)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Lock Overlay for Yield Aggregator */}
                      {locked && (
                        <div className="absolute inset-0 bg-slate-200 bg-opacity-75 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <Lock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">Connect Wallet to Unlock</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* No pools message */}
            {filteredPools.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-xl">No pools found in this category</p>
                  <p className="text-sm">Try selecting a different category or connecting your wallet</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center text-slate-500 text-sm">
              <p>Data powered by DeFiLlama • Last updated: {new Date().toLocaleString()}</p>
            </div>
          </>
        )}
        
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
              <CardHeader className="relative">
                <button
                  onClick={closeLoginModal}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-6 w-6 text-blue-600" />
                  Login to Access Yield Aggregator
                </CardTitle>
                <p className="text-slate-600">Enter your credentials to unlock advanced pools</p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({...prev, username: e.target.value}))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({...prev, password: e.target.value}))}
                      className="w-full"
                    />
                  </div>
                  
                  {loginError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      {loginError}
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    <p className="font-medium mb-1">Demo Credentials:</p>
                    <p>Username: <code className="bg-blue-100 px-1 rounded">ArcticFox</code></p>
                    <p>Password: <code className="bg-blue-100 px-1 rounded">arcticfox24</code></p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={closeLoginModal}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeFiDashboard;