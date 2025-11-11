'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, PieChart, Target, Shuffle, Info, Plus, Trash2 } from 'lucide-react';
import { Card, Button } from '@/components/ui/DesignSystem';
import {
  generateEfficientFrontier,
  findMinimumVariancePortfolio,
  findTangencyPortfolio,
  equalWeightPortfolio,
  riskParityWeights,
  calculatePortfolioStats,
  generateSampleReturns,
  EfficientFrontierPoint,
} from '@/lib/financial/portfolioOptimization';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';

/**
 * Portfolio Optimizer - Markowitz Mean-Variance Optimization
 *
 * Interactive tool for portfolio construction and efficient frontier analysis
 */

interface Asset {
  id: string;
  name: string;
  ticker: string;
  expectedReturn: number; // Annual %
  volatility: number; // Annual %
  weight: number; // Portfolio weight (0-1)
}

const DEFAULT_ASSETS: Asset[] = [
  { id: '1', name: 'S&P 500', ticker: 'SPY', expectedReturn: 10, volatility: 15, weight: 0.25 },
  { id: '2', name: 'Technology', ticker: 'QQQ', expectedReturn: 12, volatility: 20, weight: 0.25 },
  { id: '3', name: 'Bonds', ticker: 'AGG', expectedReturn: 4, volatility: 5, weight: 0.25 },
  { id: '4', name: 'Real Estate', ticker: 'VNQ', expectedReturn: 8, volatility: 18, weight: 0.25 },
];

type PortfolioStrategy = 'custom' | 'equal' | 'risk_parity' | 'min_variance' | 'tangency';

export default function PortfolioOptimizer() {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [riskFreeRate, setRiskFreeRate] = useState(3.5); // %
  const [numPortfolios, setNumPortfolios] = useState(5000);
  const [selectedStrategy, setSelectedStrategy] = useState<PortfolioStrategy>('custom');
  const [showFrontier, setShowFrontier] = useState(true);

  // Generate sample returns and covariance matrix
  const { expectedReturns, covMatrix } = useMemo(() => {
    const numAssets = assets.length;
    const numPeriods = 120; // 10 years of monthly data

    // Use sample generation for covariance (simplified)
    const sampleData = generateSampleReturns(numAssets, numPeriods);

    // Override expected returns with user inputs
    const expectedReturns = assets.map((a) => a.expectedReturn / 100);

    return {
      expectedReturns,
      covMatrix: sampleData.covMatrix,
    };
  }, [assets]);

  // Calculate efficient frontier
  const frontier = useMemo(() => {
    if (assets.length < 2) return [];
    return generateEfficientFrontier(expectedReturns, covMatrix, riskFreeRate / 100, numPortfolios);
  }, [expectedReturns, covMatrix, riskFreeRate, numPortfolios, assets]);

  // Special portfolios
  const minVariancePortfolio = useMemo(() => {
    if (frontier.length === 0) return null;
    return findMinimumVariancePortfolio(frontier);
  }, [frontier]);

  const tangencyPortfolio = useMemo(() => {
    if (frontier.length === 0) return null;
    return findTangencyPortfolio(frontier);
  }, [frontier]);

  // Current portfolio based on strategy
  const currentPortfolio = useMemo(() => {
    if (assets.length === 0) return null;

    let weights: number[];

    switch (selectedStrategy) {
      case 'equal':
        weights = equalWeightPortfolio(assets.length);
        break;
      case 'risk_parity':
        weights = riskParityWeights(covMatrix);
        break;
      case 'min_variance':
        weights = minVariancePortfolio?.weights || assets.map((a) => a.weight);
        break;
      case 'tangency':
        weights = tangencyPortfolio?.weights || assets.map((a) => a.weight);
        break;
      case 'custom':
      default:
        weights = assets.map((a) => a.weight);
    }

    const stats = calculatePortfolioStats(weights, expectedReturns, covMatrix, riskFreeRate / 100);

    return {
      weights,
      stats,
    };
  }, [assets, selectedStrategy, expectedReturns, covMatrix, riskFreeRate, minVariancePortfolio, tangencyPortfolio]);

  // Update asset weight
  const updateAssetWeight = (id: string, weight: number) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, weight } : a))
    );
  };

  // Normalize weights to sum to 1
  const normalizeWeights = () => {
    const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight === 0) return;

    setAssets((prev) =>
      prev.map((a) => ({ ...a, weight: a.weight / totalWeight }))
    );
  };

  // Add asset
  const addAsset = () => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      name: 'New Asset',
      ticker: 'NEW',
      expectedReturn: 8,
      volatility: 15,
      weight: 0,
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  // Remove asset
  const removeAsset = (id: string) => {
    if (assets.length <= 2) return; // Keep at least 2 assets
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const data: any[] = [];

    // Efficient frontier points
    if (showFrontier) {
      frontier.forEach((point) => {
        data.push({
          volatility: point.volatility * 100,
          returns: point.returns * 100,
          sharpe: point.sharpeRatio,
          type: 'Frontier',
          size: 2,
        });
      });
    }

    // Current portfolio
    if (currentPortfolio) {
      data.push({
        volatility: currentPortfolio.stats.volatility * 100,
        returns: currentPortfolio.stats.returns * 100,
        sharpe: currentPortfolio.stats.sharpeRatio,
        type: 'Current',
        size: 100,
      });
    }

    // Min variance portfolio
    if (minVariancePortfolio) {
      data.push({
        volatility: minVariancePortfolio.volatility * 100,
        returns: minVariancePortfolio.returns * 100,
        sharpe: minVariancePortfolio.sharpeRatio,
        type: 'Min Variance',
        size: 80,
      });
    }

    // Tangency portfolio
    if (tangencyPortfolio) {
      data.push({
        volatility: tangencyPortfolio.volatility * 100,
        returns: tangencyPortfolio.returns * 100,
        sharpe: tangencyPortfolio.sharpeRatio,
        type: 'Max Sharpe',
        size: 80,
      });
    }

    return data;
  }, [frontier, currentPortfolio, minVariancePortfolio, tangencyPortfolio, showFrontier]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart size={20} className="text-accent-magenta" />
          <h2 className="text-lg font-bold text-text-primary">Portfolio Optimizer</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={showFrontier}
              onChange={(e) => setShowFrontier(e.target.checked)}
              className="rounded"
            />
            Show Frontier ({numPortfolios} portfolios)
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Configuration */}
        <div className="space-y-4">
          {/* Global Parameters */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Risk-Free Rate</span>
                  <span className="text-accent-cyan font-mono">{riskFreeRate.toFixed(1)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={riskFreeRate}
                  onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Portfolio Strategy */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Strategy</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'custom', label: 'Custom', icon: Target },
                { id: 'equal', label: 'Equal Weight', icon: PieChart },
                { id: 'risk_parity', label: 'Risk Parity', icon: TrendingUp },
                { id: 'min_variance', label: 'Min Variance', icon: Target },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedStrategy(id as PortfolioStrategy)}
                  className={`p-2 rounded text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedStrategy === id
                      ? 'bg-accent-cyan text-black'
                      : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <button
                onClick={() => setSelectedStrategy('tangency')}
                className={`p-2 rounded text-xs font-medium transition-all flex items-center gap-2 col-span-2 ${
                  selectedStrategy === 'tangency'
                    ? 'bg-accent-emerald text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <Target size={14} />
                Max Sharpe (Tangency)
              </button>
            </div>
          </Card>

          {/* Assets */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Assets ({assets.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={normalizeWeights}
                  className="text-xs px-2 py-1 rounded bg-background-secondary text-text-secondary hover:text-accent-cyan transition-colors"
                  title="Normalize weights to 100%"
                >
                  Normalize
                </button>
                <button
                  onClick={addAsset}
                  className="text-xs px-2 py-1 rounded bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {assets.map((asset, idx) => (
                <div key={asset.id} className="bg-background-secondary rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={asset.name}
                        onChange={(e) =>
                          setAssets((prev) =>
                            prev.map((a) => (a.id === asset.id ? { ...a, name: e.target.value } : a))
                          )
                        }
                        className="text-xs bg-background-tertiary text-text-primary px-2 py-1 rounded"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={asset.ticker}
                        onChange={(e) =>
                          setAssets((prev) =>
                            prev.map((a) => (a.id === asset.id ? { ...a, ticker: e.target.value } : a))
                          )
                        }
                        className="text-xs bg-background-tertiary text-text-primary px-2 py-1 rounded"
                        placeholder="Ticker"
                      />
                    </div>
                    {assets.length > 2 && (
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-text-tertiary">Expected Return</label>
                      <input
                        type="number"
                        value={asset.expectedReturn}
                        onChange={(e) =>
                          setAssets((prev) =>
                            prev.map((a) =>
                              a.id === asset.id ? { ...a, expectedReturn: Number(e.target.value) } : a
                            )
                          )
                        }
                        className="w-full text-xs bg-background-tertiary text-text-primary px-2 py-1 rounded"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-tertiary">Volatility</label>
                      <input
                        type="number"
                        value={asset.volatility}
                        onChange={(e) =>
                          setAssets((prev) =>
                            prev.map((a) => (a.id === asset.id ? { ...a, volatility: Number(e.target.value) } : a))
                          )
                        }
                        className="w-full text-xs bg-background-tertiary text-text-primary px-2 py-1 rounded"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {selectedStrategy === 'custom' && (
                    <div>
                      <label className="text-[10px] text-text-tertiary flex items-center justify-between mb-1">
                        <span>Weight</span>
                        <span className="font-mono text-accent-cyan">
                          {((currentPortfolio?.weights[idx] || 0) * 100).toFixed(1)}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={asset.weight}
                        onChange={(e) => updateAssetWeight(asset.id, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  {selectedStrategy !== 'custom' && currentPortfolio && (
                    <div className="text-xs text-text-secondary">
                      Weight: <span className="font-mono text-accent-cyan">{(currentPortfolio.weights[idx] * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Visualization & Results */}
        <div className="space-y-4">
          {/* Portfolio Statistics */}
          {currentPortfolio && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Portfolio Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background-secondary rounded p-3">
                  <div className="text-xs text-text-tertiary mb-1">Expected Return</div>
                  <div className="text-2xl font-bold text-accent-emerald">
                    {(currentPortfolio.stats.returns * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-background-secondary rounded p-3">
                  <div className="text-xs text-text-tertiary mb-1">Volatility (Risk)</div>
                  <div className="text-2xl font-bold text-accent-cyan">
                    {(currentPortfolio.stats.volatility * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-background-secondary rounded p-3">
                  <div className="text-xs text-text-tertiary mb-1">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-accent-magenta">
                    {currentPortfolio.stats.sharpeRatio.toFixed(3)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Efficient Frontier Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Efficient Frontier</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                <XAxis
                  type="number"
                  dataKey="volatility"
                  name="Volatility"
                  unit="%"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  label={{ value: 'Volatility (Risk)', position: 'insideBottom', offset: -15, fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="returns"
                  name="Return"
                  unit="%"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  label={{ value: 'Expected Return', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="size" range={[2, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Return' || name === 'Volatility') return `${value.toFixed(2)}%`;
                    if (name === 'Sharpe') return value.toFixed(3);
                    return value;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  iconType="circle"
                />
                <Scatter name="Frontier" data={chartData.filter((d) => d.type === 'Frontier')} fill="#4A5568" opacity={0.3} />
                <Scatter name="Current" data={chartData.filter((d) => d.type === 'Current')} fill="#00E5FF" />
                <Scatter name="Min Variance" data={chartData.filter((d) => d.type === 'Min Variance')} fill="#8B5CF6" />
                <Scatter name="Max Sharpe" data={chartData.filter((d) => d.type === 'Max Sharpe')} fill="#00FF9F" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          {/* Special Portfolios Comparison */}
          {minVariancePortfolio && tangencyPortfolio && (
            <Card className="p-4 bg-background-secondary">
              <h4 className="text-xs font-semibold text-text-primary mb-2">Portfolio Comparison</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold text-accent-magenta mb-1">Min Variance</div>
                  <div className="text-text-tertiary space-y-0.5">
                    <div>Return: {(minVariancePortfolio.returns * 100).toFixed(2)}%</div>
                    <div>Vol: {(minVariancePortfolio.volatility * 100).toFixed(2)}%</div>
                    <div>Sharpe: {minVariancePortfolio.sharpeRatio.toFixed(3)}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-accent-emerald mb-1">Max Sharpe (Tangency)</div>
                  <div className="text-text-tertiary space-y-0.5">
                    <div>Return: {(tangencyPortfolio.returns * 100).toFixed(2)}%</div>
                    <div>Vol: {(tangencyPortfolio.volatility * 100).toFixed(2)}%</div>
                    <div>Sharpe: {tangencyPortfolio.sharpeRatio.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <Card className="p-3 bg-background-secondary">
        <div className="flex items-start gap-2 text-xs text-text-tertiary">
          <Info size={14} className="text-accent-cyan flex-shrink-0 mt-0.5" />
          <div>
            <strong>Markowitz Mean-Variance Optimization:</strong> The efficient frontier shows all optimal portfolios
            with the best risk-return tradeoff. The <strong>Min Variance</strong> portfolio has the lowest risk, while
            the <strong>Tangency Portfolio</strong> (Max Sharpe) offers the best risk-adjusted returns. Portfolios above
            the efficient frontier are impossible, and those below are suboptimal.
          </div>
        </div>
      </Card>
    </div>
  );
}
