'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, Activity, DollarSign, Info } from 'lucide-react';
import { Card } from '@/components/ui/DesignSystem';
import {
  bondPrice,
  yieldToMaturity,
  macaulayDuration,
  modifiedDuration,
  convexity,
  priceChangeEstimate,
  currentYield,
  nelsonSiegelYieldCurve,
  creditSpread,
  YieldCurvePoint,
} from '@/lib/financial/fixedIncome';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

/**
 * Bond Analyzer
 *
 * Interactive bond pricing and risk analysis tool
 */

export default function BondAnalyzer() {
  // Bond parameters
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(5.0); // %
  const [maturity, setMaturity] = useState(10); // years
  const [ytm, setYtm] = useState(5.0); // %
  const [frequency, setFrequency] = useState(2); // semi-annual

  // Convert to decimals
  const couponRateDecimal = couponRate / 100;
  const ytmDecimal = ytm / 100;

  // Calculate bond metrics
  const price = useMemo(() => {
    return bondPrice(faceValue, couponRateDecimal, maturity, ytmDecimal, frequency);
  }, [faceValue, couponRateDecimal, maturity, ytmDecimal, frequency]);

  const macDuration = useMemo(() => {
    return macaulayDuration(faceValue, couponRateDecimal, maturity, ytmDecimal, frequency);
  }, [faceValue, couponRateDecimal, maturity, ytmDecimal, frequency]);

  const modDuration = useMemo(() => {
    return modifiedDuration(faceValue, couponRateDecimal, maturity, ytmDecimal, frequency);
  }, [faceValue, couponRateDecimal, maturity, ytmDecimal, frequency]);

  const convexityValue = useMemo(() => {
    return convexity(faceValue, couponRateDecimal, maturity, ytmDecimal, frequency);
  }, [faceValue, couponRateDecimal, maturity, ytmDecimal, frequency]);

  const currYield = useMemo(() => {
    return currentYield(faceValue, couponRateDecimal, price);
  }, [faceValue, couponRateDecimal, price]);

  // Calculate YTM from price (reverse calculation)
  const impliedYTM = useMemo(() => {
    return yieldToMaturity(price, faceValue, couponRateDecimal, maturity, frequency);
  }, [price, faceValue, couponRateDecimal, maturity, frequency]);

  // Price-Yield relationship chart
  const priceYieldData = useMemo(() => {
    const data: any[] = [];
    const yieldRange = Array.from({ length: 41 }, (_, i) => (i * 0.25) / 100); // 0% to 10%

    yieldRange.forEach((y) => {
      const p = bondPrice(faceValue, couponRateDecimal, maturity, y, frequency);
      data.push({
        yield: y * 100,
        price: p,
        premium: p > faceValue,
      });
    });

    return data;
  }, [faceValue, couponRateDecimal, maturity, frequency]);

  // Duration chart (price sensitivity)
  const durationSensitivityData = useMemo(() => {
    const data: any[] = [];
    const yieldChanges = Array.from({ length: 21 }, (_, i) => (i - 10) * 0.001); // -1% to +1%

    yieldChanges.forEach((dy) => {
      const newYield = ytmDecimal + dy;
      if (newYield < 0) return;

      const actualNewPrice = bondPrice(faceValue, couponRateDecimal, maturity, newYield, frequency);
      const estimatedChange = priceChangeEstimate(price, modDuration, convexityValue, dy);
      const estimatedNewPrice = price + estimatedChange;

      data.push({
        yieldChange: dy * 10000, // basis points
        actualPrice: actualNewPrice,
        estimatedPrice: estimatedNewPrice,
        durationOnly: price - modDuration * price * dy,
      });
    });

    return data;
  }, [faceValue, couponRateDecimal, maturity, ytmDecimal, frequency, price, modDuration, convexityValue]);

  // Yield curve
  const yieldCurveData = useMemo(() => {
    const maturities = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
    const curve = nelsonSiegelYieldCurve(maturities);

    return curve.map((point) => ({
      maturity: point.maturity,
      yield: point.yield * 100,
    }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-accent-emerald" />
          <h2 className="text-lg font-bold text-text-primary">Fixed Income Bond Analyzer</h2>
        </div>
        <div className="flex gap-2">
          {[
            { freq: 1, label: 'Annual' },
            { freq: 2, label: 'Semi-Annual' },
            { freq: 4, label: 'Quarterly' },
          ].map(({ freq, label }) => (
            <button
              key={freq}
              onClick={() => setFrequency(freq)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                frequency === freq
                  ? 'bg-accent-cyan text-black'
                  : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Inputs & Bond Metrics */}
        <div className="space-y-4">
          {/* Bond Parameters */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Bond Parameters</h3>

            <div className="space-y-3">
              {/* Face Value */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Face Value</span>
                  <span className="text-accent-cyan font-mono">${faceValue.toFixed(0)}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={faceValue}
                  onChange={(e) => setFaceValue(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Coupon Rate */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Coupon Rate</span>
                  <span className="text-accent-emerald font-mono">{couponRate.toFixed(2)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.25"
                  value={couponRate}
                  onChange={(e) => setCouponRate(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Maturity */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Years to Maturity</span>
                  <span className="text-accent-magenta font-mono">{maturity} yrs</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={maturity}
                  onChange={(e) => setMaturity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Yield to Maturity */}
              <div>
                <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                  <span>Yield to Maturity (YTM)</span>
                  <span className="text-accent-cyan font-mono">{ytm.toFixed(2)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.25"
                  value={ytm}
                  onChange={(e) => setYtm(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Bond Price & Valuation */}
          <Card className="p-4 bg-gradient-to-br from-accent-emerald/5 to-accent-emerald/10 border-2 border-accent-emerald/30">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Bond Price</h3>

            <div className="text-5xl font-bold text-accent-emerald mb-2">${price.toFixed(2)}</div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-text-tertiary">vs Par</div>
                <div
                  className={`font-semibold ${
                    price > faceValue ? 'text-accent-emerald' : price < faceValue ? 'text-red-400' : 'text-text-primary'
                  }`}
                >
                  {price > faceValue ? 'Premium' : price < faceValue ? 'Discount' : 'At Par'}
                </div>
              </div>
              <div>
                <div className="text-text-tertiary">Current Yield</div>
                <div className="font-mono text-text-primary">{(currYield * 100).toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-text-tertiary">Annual Coupon</div>
                <div className="font-mono text-text-primary">${(faceValue * couponRateDecimal).toFixed(2)}</div>
              </div>
            </div>
          </Card>

          {/* Risk Metrics */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Risk Metrics</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock size={12} />
                  <span>Macaulay Duration</span>
                </div>
                <span className="text-sm font-bold text-accent-cyan">{macDuration.toFixed(2)} years</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <TrendingUp size={12} />
                  <span>Modified Duration</span>
                </div>
                <span className="text-sm font-bold text-accent-magenta">{modDuration.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Activity size={12} />
                  <span>Convexity</span>
                </div>
                <span className="text-sm font-bold text-accent-emerald">{convexityValue.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-border-primary">
                <div className="text-xs text-text-tertiary mb-2">Price Change for 1% Yield Increase:</div>
                <div className="text-lg font-bold text-red-400">
                  ${priceChangeEstimate(price, modDuration, convexityValue, 0.01).toFixed(2)}
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  ({((priceChangeEstimate(price, modDuration, convexityValue, 0.01) / price) * 100).toFixed(2)}% of price)
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Visualizations */}
        <div className="space-y-4">
          {/* Price-Yield Relationship */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Price-Yield Relationship</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={priceYieldData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                <XAxis
                  dataKey="yield"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ value: 'Yield (%)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'price') return `$${value.toFixed(2)}`;
                    return value;
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="#00FF9F" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey={() => price}
                  stroke="#00E5FF"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Current"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-text-tertiary text-center mt-2">
              Inverse relationship: As yields rise, bond prices fall
            </div>
          </Card>

          {/* Duration & Convexity */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Duration vs Convexity Approximation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={durationSensitivityData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                <XAxis
                  dataKey="yieldChange"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ value: 'Yield Change (bps)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="actualPrice" stroke="#00FF9F" strokeWidth={2} name="Actual" dot={false} />
                <Line
                  type="monotone"
                  dataKey="estimatedPrice"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Duration + Convexity"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="durationOnly"
                  stroke="#C026D3"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name="Duration Only"
                  dot={false}
                  opacity={0.5}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-text-tertiary text-center mt-2">
              Convexity improves duration approximation for large yield changes
            </div>
          </Card>

          {/* Yield Curve */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Treasury Yield Curve (Nelson-Siegel)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={yieldCurveData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                <XAxis
                  dataKey="maturity"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ value: 'Maturity (Years)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => `${value.toFixed(2)}%`}
                />
                <Area type="monotone" dataKey="yield" stroke="#00E5FF" fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="text-xs text-text-tertiary text-center mt-2">Normal upward-sloping curve</div>
          </Card>
        </div>
      </div>

      {/* Info Footer */}
      <Card className="p-3 bg-background-secondary">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-semibold text-accent-cyan mb-1">Duration</div>
            <div className="text-text-tertiary">
              Measures price sensitivity to interest rate changes. Modified Duration estimates the % price change for a 1%
              yield change.
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-emerald mb-1">Convexity</div>
            <div className="text-text-tertiary">
              Measures the curvature of the price-yield relationship. Higher convexity means less downside risk when yields
              rise.
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-magenta mb-1">Yield Curve</div>
            <div className="text-text-tertiary">
              Plots yields across maturities. Shape indicates market expectations: upward = growth, flat = uncertainty,
              inverted = recession.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
