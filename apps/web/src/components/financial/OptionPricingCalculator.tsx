'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calculator, Info, DollarSign, Clock, Activity, Zap } from 'lucide-react';
import { Card } from '@/components/ui/DesignSystem';
import {
  callPrice,
  putPrice,
  calculateGreeks,
  impliedVolatility,
  intrinsicValue,
  timeValue,
  moneyness,
  putCallParity,
} from '@/lib/financial/blackScholes';

/**
 * Option Pricing Calculator
 *
 * Interactive Black-Scholes option pricing calculator with Greeks
 */
export default function OptionPricingCalculator() {
  // Input parameters
  const [stockPrice, setStockPrice] = useState(100);
  const [strikePrice, setStrikePrice] = useState(100);
  const [daysToExpiration, setDaysToExpiration] = useState(365);
  const [riskFreeRate, setRiskFreeRate] = useState(5); // %
  const [volatility, setVolatility] = useState(20); // %
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');

  // Convert inputs to Black-Scholes parameters
  const T = daysToExpiration / 365;
  const r = riskFreeRate / 100;
  const sigma = volatility / 100;

  // Calculate option price and Greeks
  const optionPrice = useMemo(() => {
    return optionType === 'call'
      ? callPrice(stockPrice, strikePrice, T, r, sigma)
      : putPrice(stockPrice, strikePrice, T, r, sigma);
  }, [stockPrice, strikePrice, T, r, sigma, optionType]);

  const greeks = useMemo(() => {
    return calculateGreeks(stockPrice, strikePrice, T, r, sigma, optionType);
  }, [stockPrice, strikePrice, T, r, sigma, optionType]);

  const intrinsic = intrinsicValue(stockPrice, strikePrice, optionType);
  const timeVal = timeValue(optionPrice, stockPrice, strikePrice, optionType);
  const moneynessStatus = moneyness(stockPrice, strikePrice, optionType);

  // Put-Call Parity check
  const callPriceVal = callPrice(stockPrice, strikePrice, T, r, sigma);
  const putPriceVal = putPrice(stockPrice, strikePrice, T, r, sigma);
  const parityDiff = putCallParity(callPriceVal, putPriceVal, stockPrice, strikePrice, T, r);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-accent-cyan" />
          <h2 className="text-lg font-bold text-text-primary">
            Black-Scholes Option Pricing
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOptionType('call')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              optionType === 'call'
                ? 'bg-accent-emerald text-black'
                : 'bg-background-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            Call
          </button>
          <button
            onClick={() => setOptionType('put')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              optionType === 'put'
                ? 'bg-red-500 text-white'
                : 'bg-background-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            Put
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Inputs */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Parameters</h3>

          <div className="space-y-4">
            {/* Stock Price */}
            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Stock Price (S)</span>
                <span className="text-accent-cyan font-mono">${stockPrice.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={stockPrice}
                onChange={(e) => setStockPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Strike Price */}
            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Strike Price (K)</span>
                <span className="text-accent-magenta font-mono">${strikePrice.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={strikePrice}
                onChange={(e) => setStrikePrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Days to Expiration */}
            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Days to Expiration</span>
                <span className="text-accent-emerald font-mono">{daysToExpiration} days</span>
              </label>
              <input
                type="range"
                min="1"
                max="730"
                value={daysToExpiration}
                onChange={(e) => setDaysToExpiration(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Risk-Free Rate */}
            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Risk-Free Rate (r)</span>
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

            {/* Volatility */}
            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Volatility (σ)</span>
                <span className="text-accent-magenta font-mono">{volatility.toFixed(1)}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={volatility}
                onChange={(e) => setVolatility(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Right: Results */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Valuation</h3>

          {/* Option Price */}
          <div className="bg-background-secondary rounded-lg p-4 mb-4">
            <div className="text-xs text-text-tertiary mb-2">
              {optionType === 'call' ? 'Call' : 'Put'} Option Price
            </div>
            <div className={`text-4xl font-bold font-mono ${
              optionType === 'call' ? 'text-accent-emerald' : 'text-red-400'
            }`}>
              ${optionPrice.toFixed(2)}
            </div>
            <div className="mt-2 pt-2 border-t border-border-primary grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-text-tertiary">Intrinsic</div>
                <div className="font-mono text-text-primary">${intrinsic.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-tertiary">Time Value</div>
                <div className="font-mono text-accent-cyan">${timeVal.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-tertiary">Moneyness</div>
                <div className={`font-semibold ${
                  moneynessStatus === 'ITM' ? 'text-accent-emerald' :
                  moneynessStatus === 'ATM' ? 'text-accent-cyan' :
                  'text-text-tertiary'
                }`}>
                  {moneynessStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Greeks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <TrendingUp size={12} />
                <span>Delta (Δ)</span>
              </div>
              <span className={`font-mono font-semibold ${
                greeks.delta > 0 ? 'text-accent-emerald' : 'text-red-400'
              }`}>
                {greeks.delta.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <Activity size={12} />
                <span>Gamma (Γ)</span>
              </div>
              <span className="font-mono font-semibold text-accent-cyan">
                {greeks.gamma.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <Zap size={12} />
                <span>Vega (ν)</span>
              </div>
              <span className="font-mono font-semibold text-accent-magenta">
                {greeks.vega.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <Clock size={12} />
                <span>Theta (Θ)</span>
              </div>
              <span className={`font-mono font-semibold ${
                greeks.theta < 0 ? 'text-red-400' : 'text-accent-emerald'
              }`}>
                {greeks.theta.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <DollarSign size={12} />
                <span>Rho (ρ)</span>
              </div>
              <span className={`font-mono font-semibold ${
                greeks.rho > 0 ? 'text-accent-emerald' : 'text-red-400'
              }`}>
                {greeks.rho.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Put-Call Parity Check */}
          <div className="mt-4 pt-4 border-t border-border-primary">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-tertiary">
                <Info size={12} />
                <span>Put-Call Parity</span>
              </div>
              <span className={`font-mono text-xs ${
                Math.abs(parityDiff) < 0.01 ? 'text-accent-emerald' : 'text-red-400'
              }`}>
                {Math.abs(parityDiff) < 0.01 ? '✓ Valid' : `Δ ${parityDiff.toFixed(4)}`}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Greeks Explanation */}
      <Card className="p-4 bg-background-secondary">
        <h4 className="text-xs font-semibold text-text-primary mb-2">Greeks Interpretation</h4>
        <div className="grid grid-cols-5 gap-3 text-xs">
          <div>
            <div className="font-semibold text-accent-emerald mb-1">Delta</div>
            <div className="text-text-tertiary">
              For $1 ↑ in stock, option price changes by ${Math.abs(greeks.delta).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-cyan mb-1">Gamma</div>
            <div className="text-text-tertiary">
              Delta changes by {greeks.gamma.toFixed(4)} per $1 stock move
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-magenta mb-1">Vega</div>
            <div className="text-text-tertiary">
              For 1% ↑ in volatility, option price changes by ${greeks.vega.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-red-400 mb-1">Theta</div>
            <div className="text-text-tertiary">
              Time decay: ${Math.abs(greeks.theta).toFixed(2)} lost per day
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-cyan mb-1">Rho</div>
            <div className="text-text-tertiary">
              For 1% ↑ in rates, option price changes by ${Math.abs(greeks.rho).toFixed(2)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
