'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, TrendingDown, Shield, Activity, Zap, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/DesignSystem';
import {
  historicalVaR,
  parametricVaR,
  monteCarloVaR,
  conditionalVaR,
  portfolioVaR,
  componentVaR,
  marginalVaR,
  runStressTest,
  STRESS_SCENARIOS,
  findMaxDrawdownPeriod,
  varAttribution,
  parametricExpectedShortfall,
  scaleVaR,
  StressTestResult,
} from '@/lib/financial/riskMetrics';
import { generateSampleReturns } from '@/lib/financial/portfolioOptimization';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

/**
 * Risk Dashboard
 *
 * Comprehensive risk management interface with VaR, CVaR, and stress testing
 */

interface AssetAllocation {
  name: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
}

const DEFAULT_ALLOCATIONS: AssetAllocation[] = [
  { name: 'US Stocks', weight: 0.40, expectedReturn: 0.10, volatility: 0.18 },
  { name: 'Intl Stocks', weight: 0.25, expectedReturn: 0.08, volatility: 0.20 },
  { name: 'Bonds', weight: 0.25, expectedReturn: 0.04, volatility: 0.06 },
  { name: 'Commodities', weight: 0.10, expectedReturn: 0.06, volatility: 0.22 },
];

export default function RiskDashboard() {
  const [allocations, setAllocations] = useState<AssetAllocation[]>(DEFAULT_ALLOCATIONS);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95); // 95%
  const [timeHorizon, setTimeHorizon] = useState(1); // days
  const [portfolioValue, setPortfolioValue] = useState(1000000); // $1M
  const [selectedMethod, setSelectedMethod] = useState<'historical' | 'parametric' | 'monte_carlo'>('parametric');

  // Generate sample returns and calculate metrics
  const { returns, expectedReturns, covMatrix, portfolioMetrics } = useMemo(() => {
    const numPeriods = 252; // 1 year of daily returns
    const sampleData = generateSampleReturns(allocations.length, numPeriods);

    // Override with user inputs
    const expectedReturns = allocations.map((a) => a.expectedReturn);
    const weights = allocations.map((a) => a.weight);

    // Portfolio mean and std dev
    const portfolioMean = weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
    let portfolioVariance = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        portfolioVariance += weights[i] * weights[j] * sampleData.covMatrix[i][j];
      }
    }
    const portfolioStdDev = Math.sqrt(portfolioVariance);

    return {
      returns: sampleData.returns,
      expectedReturns,
      covMatrix: sampleData.covMatrix,
      portfolioMetrics: {
        mean: portfolioMean,
        stdDev: portfolioStdDev,
        weights,
      },
    };
  }, [allocations]);

  // Calculate VaR using different methods
  const varCalculations = useMemo(() => {
    const weights = allocations.map((a) => a.weight);

    // Historical VaR (from sample returns)
    const portfolioReturns = returns.map((periodReturns) =>
      periodReturns.reduce((sum, ret, i) => sum + weights[i] * ret, 0)
    );
    const historicalVar = historicalVaR(portfolioReturns, confidenceLevel);

    // Parametric VaR
    const parametricVar = parametricVaR(
      portfolioMetrics.mean / 252, // Daily mean
      portfolioMetrics.stdDev / Math.sqrt(252), // Daily std dev
      confidenceLevel
    );

    // Monte Carlo VaR
    const mcVar = monteCarloVaR(
      portfolioMetrics.mean / 252,
      portfolioMetrics.stdDev / Math.sqrt(252),
      10000,
      confidenceLevel
    );

    // CVaR (Expected Shortfall)
    const cvar = conditionalVaR(portfolioReturns, confidenceLevel);

    // Expected Shortfall (parametric)
    const es = parametricExpectedShortfall(
      portfolioMetrics.mean / 252,
      portfolioMetrics.stdDev / Math.sqrt(252),
      confidenceLevel
    );

    // Scale to time horizon and portfolio value
    const scalingFactor = Math.sqrt(timeHorizon);
    const historicalVarScaled = historicalVar * scalingFactor * portfolioValue;
    const parametricVarScaled = parametricVar * scalingFactor * portfolioValue;
    const mcVarScaled = mcVar * scalingFactor * portfolioValue;
    const cvarScaled = cvar * scalingFactor * portfolioValue;
    const esScaled = es * scalingFactor * portfolioValue;

    return {
      historical: { value: historicalVarScaled, percentage: historicalVar * 100 },
      parametric: { value: parametricVarScaled, percentage: parametricVar * 100 },
      monteCarlo: { value: mcVarScaled, percentage: mcVar * 100 },
      cvar: { value: cvarScaled, percentage: cvar * 100 },
      expectedShortfall: { value: esScaled, percentage: es * 100 },
    };
  }, [allocations, confidenceLevel, timeHorizon, portfolioValue, returns, portfolioMetrics]);

  // Component VaR (risk contribution by asset)
  const componentVarData = useMemo(() => {
    const weights = allocations.map((a) => a.weight);
    const componentVars = componentVaR(weights, expectedReturns, covMatrix, confidenceLevel);

    return allocations.map((asset, i) => ({
      name: asset.name,
      componentVar: componentVars[i] * 100,
      weight: asset.weight * 100,
      marginalVar: marginalVaR(weights, expectedReturns, covMatrix, confidenceLevel)[i] * 100,
    }));
  }, [allocations, expectedReturns, covMatrix, confidenceLevel]);

  // Stress Testing
  const stressTestResults = useMemo(() => {
    const weights = allocations.map((a) => a.weight);

    return STRESS_SCENARIOS.map((scenario) =>
      runStressTest(weights, scenario)
    );
  }, [allocations]);

  // Maximum Drawdown
  const drawdownAnalysis = useMemo(() => {
    // Generate cumulative returns
    const weights = allocations.map((a) => a.weight);
    const cumulativeReturns: number[] = [portfolioValue];

    for (let t = 1; t < returns.length; t++) {
      const periodReturn = returns[t].reduce((sum, ret, i) => sum + weights[i] * ret, 0);
      cumulativeReturns.push(cumulativeReturns[t - 1] * (1 + periodReturn));
    }

    return findMaxDrawdownPeriod(cumulativeReturns);
  }, [returns, allocations, portfolioValue]);

  // Selected VaR value
  const selectedVaR =
    selectedMethod === 'historical'
      ? varCalculations.historical
      : selectedMethod === 'parametric'
      ? varCalculations.parametric
      : varCalculations.monteCarlo;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-red-400" />
          <h2 className="text-lg font-bold text-text-primary">Risk Management Dashboard</h2>
        </div>
        <div className="text-xs text-text-tertiary">
          VaR @ {(confidenceLevel * 100).toFixed(0)}% confidence · {timeHorizon}d horizon
        </div>
      </div>

      {/* Main VaR Display */}
      <Card className="p-4 bg-gradient-to-br from-red-500/5 to-red-500/10 border-2 border-red-500/30">
        <div className="grid grid-cols-4 gap-4">
          {/* Value at Risk */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold text-text-primary">Value at Risk (VaR)</h3>
            </div>
            <div className="text-4xl font-bold text-red-400 mb-1">
              ${(selectedVaR.value / 1000).toFixed(1)}K
            </div>
            <div className="text-sm text-text-tertiary">
              {selectedVaR.percentage.toFixed(2)}% of portfolio
            </div>
            <div className="mt-3 text-xs text-text-secondary">
              Maximum expected loss at {(confidenceLevel * 100).toFixed(0)}% confidence level over {timeHorizon} day
              {timeHorizon > 1 ? 's' : ''}
            </div>
          </div>

          {/* CVaR / Expected Shortfall */}
          <div>
            <div className="text-xs text-text-tertiary mb-2">Conditional VaR (CVaR)</div>
            <div className="text-2xl font-bold text-orange-400">
              ${(varCalculations.cvar.value / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-text-tertiary mt-1">
              {varCalculations.cvar.percentage.toFixed(2)}%
            </div>
            <div className="mt-2 text-xs text-text-secondary">Average loss beyond VaR</div>
          </div>

          {/* Max Drawdown */}
          <div>
            <div className="text-xs text-text-tertiary mb-2">Maximum Drawdown</div>
            <div className="text-2xl font-bold text-red-400">
              {(drawdownAnalysis.drawdown * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-text-tertiary mt-1">{drawdownAnalysis.duration} days</div>
            <div className="mt-2 text-xs text-text-secondary">Peak-to-trough decline</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Configuration */}
        <div className="space-y-4">
          {/* Parameters */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Risk Parameters</h3>

            <div className="space-y-3">
              {/* Portfolio Value */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Portfolio Value</span>
                  <span className="text-accent-cyan font-mono">${(portfolioValue / 1000000).toFixed(2)}M</span>
                </label>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="100000"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Confidence Level */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Confidence Level</span>
                  <span className="text-accent-magenta font-mono">{(confidenceLevel * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.90"
                  max="0.99"
                  step="0.01"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Time Horizon */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Time Horizon</span>
                  <span className="text-accent-emerald font-mono">{timeHorizon} day{timeHorizon > 1 ? 's' : ''}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* VaR Method */}
              <div>
                <label className="text-xs text-text-secondary mb-2 block">VaR Calculation Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'historical', label: 'Historical' },
                    { id: 'parametric', label: 'Parametric' },
                    { id: 'monte_carlo', label: 'Monte Carlo' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedMethod(id as any)}
                      className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                        selectedMethod === id
                          ? 'bg-red-500 text-white'
                          : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* VaR Comparison */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">VaR Method Comparison</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Historical VaR</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary">{varCalculations.historical.percentage.toFixed(2)}%</span>
                  <span className="font-mono text-red-400 font-semibold">
                    ${(varCalculations.historical.value / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Parametric VaR</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary">{varCalculations.parametric.percentage.toFixed(2)}%</span>
                  <span className="font-mono text-red-400 font-semibold">
                    ${(varCalculations.parametric.value / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Monte Carlo VaR</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary">{varCalculations.monteCarlo.percentage.toFixed(2)}%</span>
                  <span className="font-mono text-red-400 font-semibold">
                    ${(varCalculations.monteCarlo.value / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border-primary flex items-center justify-between text-xs">
                <span className="text-text-secondary font-semibold">CVaR (ES)</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary">{varCalculations.cvar.percentage.toFixed(2)}%</span>
                  <span className="font-mono text-orange-400 font-semibold">
                    ${(varCalculations.cvar.value / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Component VaR */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Risk Contribution by Asset</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={componentVarData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} label={{ value: 'Component VaR (%)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => `${value.toFixed(3)}%`}
                />
                <Bar dataKey="componentVar" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Right: Stress Testing */}
        <div className="space-y-4">
          {/* Stress Test Results */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-text-primary">Stress Test Scenarios</h3>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {stressTestResults.map((result, idx) => {
                const loss = result.portfolioLoss * portfolioValue;
                const lossPercent = result.percentageLoss;

                return (
                  <div
                    key={idx}
                    className="bg-background-secondary rounded-lg p-3 border-l-4"
                    style={{
                      borderLeftColor:
                        Math.abs(lossPercent) > 30
                          ? '#EF4444'
                          : Math.abs(lossPercent) > 20
                          ? '#F97316'
                          : '#FBBF24',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-text-primary">{result.scenario.name}</h4>
                        <p className="text-xs text-text-tertiary mt-0.5">{result.scenario.description}</p>
                      </div>
                      <div className="text-right ml-2">
                        <div
                          className={`text-lg font-bold font-mono ${
                            Math.abs(lossPercent) > 30
                              ? 'text-red-400'
                              : Math.abs(lossPercent) > 20
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {lossPercent > 0 ? '-' : '+'}{Math.abs(lossPercent).toFixed(1)}%
                        </div>
                        <div className="text-xs text-text-tertiary">
                          ${(Math.abs(loss) / 1000).toFixed(0)}K loss
                        </div>
                      </div>
                    </div>

                    {/* Component losses */}
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {result.componentLosses.map((compLoss, i) => (
                        <div key={i} className="text-xs text-text-tertiary">
                          {allocations[i].name}: <span className="font-mono text-red-400">{(compLoss * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Portfolio Allocation */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Portfolio Allocation</h3>
            <div className="space-y-2">
              {allocations.map((asset, idx) => (
                <div key={idx} className="bg-background-secondary rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-primary font-medium">{asset.name}</span>
                    <span className="text-xs text-accent-cyan font-mono">{(asset.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-text-tertiary">
                    <div>Return: {(asset.expectedReturn * 100).toFixed(1)}%</div>
                    <div>Vol: {(asset.volatility * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Info Footer */}
      <Card className="p-3 bg-background-secondary">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-semibold text-red-400 mb-1">Value at Risk (VaR)</div>
            <div className="text-text-tertiary">
              Maximum expected loss at a given confidence level. 95% VaR means 95% of the time, losses won't exceed this amount.
            </div>
          </div>
          <div>
            <div className="font-semibold text-orange-400 mb-1">Conditional VaR (CVaR)</div>
            <div className="text-text-tertiary">
              Average loss in the worst 5% of cases (beyond VaR). Also called Expected Shortfall. More conservative than VaR.
            </div>
          </div>
          <div>
            <div className="font-semibold text-yellow-400 mb-1">Stress Testing</div>
            <div className="text-text-tertiary">
              Portfolio performance under extreme scenarios like financial crises. Tests resilience to tail risk events.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
