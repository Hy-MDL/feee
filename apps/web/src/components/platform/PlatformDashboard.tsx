'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { companies, Company } from '@/data/companies';
import { Search } from 'lucide-react';
import { ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart } from 'recharts';
import NewsFeed from './NewsFeed';
import CommunityPanel from './CommunityPanel';
import LivePriceIndicator from '../finance/LivePriceIndicator';
import PriceHistoryChart from '../finance/PriceHistoryChart';
import Movers from '../finance/Movers';
import Watchlist from '../finance/Watchlist';
import PriceAlertModal from '../finance/PriceAlertModal';
import MacroControlPanel from '../macro/MacroControlPanel';
import {
  MACRO_VARIABLES,
  MACRO_CATEGORIES,
  MacroCategory,
  getVariablesByCategory,
  getDefaultMacroState
} from '@/data/macroVariables';
import { useMacroStore } from '@/lib/store/macroStore';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#0D0D0F] border border-[#1A1A1F] rounded-2xl p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, icon, className = '' }: { children: React.ReactNode, icon?: React.ReactNode, className?: string }) => (
  <h3 className={`text-base font-semibold text-text-primary mb-4 flex items-center gap-2 ${className}`}>
    {icon}
    {children}
  </h3>
);

const generateDeterministicMock = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
  const random = (hash & 0x7fffffff) / 0x7fffffff;
  return min + random * (max - min);
};

// Analysis Components
const FundamentalAnalysis = ({ company }: { company: Company }) => {
  const calculateAdjustedFinancials = useMacroStore(state => state.calculateAdjustedFinancials);
  const adjustedFinancials = calculateAdjustedFinancials(company);

  // Calculate percentage changes
  const calculateChange = (base: number, adjusted: number) => {
    if (base === 0) return 0;
    return ((adjusted - base) / base) * 100;
  };

  const revenueChange = calculateChange(company.financials.revenue, adjustedFinancials.revenue);
  const operatingIncomeChange = calculateChange(
    company.financials.operating_income || 0,
    adjustedFinancials.operating_income
  );
  const netIncomeChange = calculateChange(company.financials.net_income, adjustedFinancials.net_income);
  const baseEbitda = (company.financials.operating_income || 0) * 1.2;
  const ebitdaChange = calculateChange(baseEbitda, adjustedFinancials.ebitda);
  const assetsChange = calculateChange(company.financials.total_assets, adjustedFinancials.total_assets);
  const debtChange = calculateChange(company.financials.total_debt, adjustedFinancials.total_debt);
  const equityChange = calculateChange(company.financials.equity, adjustedFinancials.equity);

  const ChangeIndicator = ({ change }: { change: number }) => {
    if (Math.abs(change) < 0.01) return <span className="text-text-tertiary text-xs ml-2">—</span>;
    return (
      <span className={`text-xs font-semibold ml-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Key Ratios Section */}
      <div>
        <h4 className="font-bold text-text-primary mb-3">Key Ratios</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-black rounded-lg border border-border-primary">
            <div className="text-text-secondary text-xs mb-1">P/E Ratio</div>
            <div className="font-bold text-text-primary text-lg">{company.ratios?.pe_ratio?.toFixed(1) || 'N/A'}</div>
          </div>
          <div className="text-center p-3 bg-black rounded-lg border border-border-primary">
            <div className="text-text-secondary text-xs mb-1">ROE</div>
            <div className="font-bold text-text-primary text-lg">{company.ratios?.roe?.toFixed(1) || 'N/A'}%</div>
          </div>
          <div className="text-center p-3 bg-black rounded-lg border border-border-primary">
            <div className="text-text-secondary text-xs mb-1">D/E Ratio</div>
            <div className="font-bold text-text-primary text-lg">{company.ratios?.de_ratio?.toFixed(1) || 'N/A'}</div>
          </div>
          <div className="text-center p-3 bg-black rounded-lg border border-border-primary">
            <div className="text-text-secondary text-xs mb-1">ICR</div>
            <div className={`font-bold text-lg ${
              company.ratios?.icr && company.ratios.icr > 2
                ? 'text-status-safe'
                : company.ratios?.icr && company.ratios.icr > 0
                ? 'text-status-caution'
                : 'text-status-danger'
            }`}>
              {company.ratios?.icr?.toFixed(1) || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Statements - Side-by-Side Comparison */}
      <div>
        <h4 className="font-bold text-text-primary mb-3">Income Statement</h4>
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-text-tertiary">
          <div></div>
          <div className="text-center font-semibold">Base</div>
          <div className="text-center font-semibold">Macro-Adjusted</div>
        </div>
        <div className="space-y-2 p-4 bg-black rounded-lg">
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Revenue:</span>
            <span className="font-mono text-text-primary text-center">${company.financials.revenue.toLocaleString()} M</span>
            <div className="text-center">
              <span className={`font-mono ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.revenue.toLocaleString()} M
              </span>
              <ChangeIndicator change={revenueChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Operating Income:</span>
            <span className="font-mono text-text-primary text-center">${company.financials.operating_income?.toLocaleString() || 'N/A'} M</span>
            <div className="text-center">
              <span className={`font-mono ${operatingIncomeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.operating_income.toLocaleString()} M
              </span>
              <ChangeIndicator change={operatingIncomeChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Net Income:</span>
            <span className="font-mono text-text-primary text-center">${company.financials.net_income.toLocaleString()} M</span>
            <div className="text-center">
              <span className={`font-mono ${netIncomeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.net_income.toLocaleString()} M
              </span>
              <ChangeIndicator change={netIncomeChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">EBITDA:</span>
            <span className="font-mono text-text-primary text-center">${baseEbitda.toLocaleString()} M</span>
            <div className="text-center">
              <span className={`font-mono ${ebitdaChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.ebitda.toLocaleString()} M
              </span>
              <ChangeIndicator change={ebitdaChange} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-text-primary mb-3">Balance Sheet</h4>
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-text-tertiary">
          <div></div>
          <div className="text-center font-semibold">Base</div>
          <div className="text-center font-semibold">Macro-Adjusted</div>
        </div>
        <div className="space-y-2 p-4 bg-black rounded-lg">
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Total Assets:</span>
            <span className="font-mono text-text-primary text-center">${company.financials.total_assets.toLocaleString()} M</span>
            <div className="text-center">
              <span className={`font-mono ${assetsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.total_assets.toLocaleString()} M
              </span>
              <ChangeIndicator change={assetsChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Total Debt:</span>
            <span className="font-mono text-text-primary text-center">${company.financials.total_debt.toLocaleString()} M</span>
            <div className="text-center">
              <span className={`font-mono ${debtChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.total_debt.toLocaleString()} M
              </span>
              <ChangeIndicator change={debtChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Equity:</span>
            <span className="font-mono text-text-primary text-center">${company.financials.equity.toLocaleString()} M</span>
            <div className="text-center">
              <span className={`font-mono ${equityChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${adjustedFinancials.equity.toLocaleString()} M
              </span>
              <ChangeIndicator change={equityChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-text-secondary">Current Ratio:</span>
            <span className="font-mono text-text-primary text-center">{(company.financials.total_assets / company.financials.total_debt * 0.4).toFixed(2)}</span>
            <span className="font-mono text-text-primary text-center">{(adjustedFinancials.total_assets / adjustedFinancials.total_debt * 0.4).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TechnicalAnalysis = ({ ticker }: { ticker: string }) => {
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const basePrice = 100;
    const price = generateDeterministicMock(`${ticker}-price-${i}`, basePrice * 0.9, basePrice * 1.1);
    const ma20 = basePrice + Math.sin(i * 0.2) * 5;
    const ma50 = basePrice + Math.sin(i * 0.1) * 3;
    const upper = price + generateDeterministicMock(`${ticker}-bb-${i}`, 5, 8);
    const lower = price - generateDeterministicMock(`${ticker}-bb-${i}`, 5, 8);

    return {
      day: i + 1,
      rsi: generateDeterministicMock(`${ticker}-rsi-${i}`, 30, 70),
      macd: generateDeterministicMock(`${ticker}-macd-${i}`, -0.5, 0.5),
      stochastic: generateDeterministicMock(`${ticker}-stoch-${i}`, 20, 80),
      volume: generateDeterministicMock(`${ticker}-vol-${i}`, 500000, 2000000),
      price,
      ma20,
      ma50,
      upper,
      lower
    };
  }), [ticker]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* RSI */}
      <div className="min-h-[160px]">
        <h4 className="text-sm font-semibold text-text-primary mb-2">RSI (14)</h4>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
            <Tooltip contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F' }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Area type="monotone" dataKey="rsi" stroke="#E6007A" fill="#E6007A" fillOpacity={0.2} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MACD */}
      <div className="min-h-[160px]">
        <h4 className="text-sm font-semibold text-text-primary mb-2">MACD</h4>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
            <Tooltip contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F' }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Area type="monotone" dataKey="macd" stroke="#39FF14" fill="#39FF14" fillOpacity={0.2} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bollinger Bands */}
      <div className="min-h-[160px]">
        <h4 className="text-sm font-semibold text-text-primary mb-2">Bollinger Bands</h4>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
            <Tooltip contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F' }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Area type="monotone" dataKey="upper" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.1} strokeWidth={1} dot={false} />
            <Area type="monotone" dataKey="lower" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.1} strokeWidth={1} dot={false} />
            <Area type="monotone" dataKey="price" stroke="#FFFFFF" fill="none" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Moving Averages */}
      <div className="min-h-[160px]">
        <h4 className="text-sm font-semibold text-text-primary mb-2">Moving Averages (20/50)</h4>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
            <Tooltip contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F' }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Area type="monotone" dataKey="price" stroke="#FFFFFF" fill="#FFFFFF" fillOpacity={0.1} strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="ma20" stroke="#00E5FF" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            <Area type="monotone" dataKey="ma50" stroke="#E6007A" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stochastic Oscillator */}
      <div className="min-h-[160px]">
        <h4 className="text-sm font-semibold text-text-primary mb-2">Stochastic Oscillator</h4>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
            <Tooltip contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F' }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Area type="monotone" dataKey="stochastic" stroke="#FFD700" fill="#FFD700" fillOpacity={0.2} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume */}
      <div className="min-h-[160px]">
        <h4 className="text-sm font-semibold text-text-primary mb-2">Volume</h4>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1F" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0D0D0F', border: '1px solid #1A1A1F' }}
              formatter={(value: any) => [(value / 1000000).toFixed(2) + 'M', 'Volume']}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Bar dataKey="volume" fill="#9333EA" opacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnalysisReport = ({ company }: { company: Company }) => {
  const [reportType, setReportType] = useState<'official' | 'community' | 'create'>('official');
  const [newReport, setNewReport] = useState({ title: '', content: '', rating: 'BUY' });

  // Mock official reports
  const officialReports = [
    {
      id: 1,
      analyst: 'Goldman Sachs',
      date: '2025-01-05',
      rating: 'BUY',
      target: company.financials.equity / 180,
      summary: `Strong fundamentals with robust revenue growth. ${company.sector} sector showing resilience in current macro environment.`
    },
    {
      id: 2,
      analyst: 'Morgan Stanley',
      date: '2025-01-02',
      rating: 'HOLD',
      target: company.financials.equity / 200,
      summary: 'Valuation at fair levels. Monitoring macro headwinds and sector rotation patterns.'
    }
  ];

  // Mock community reports
  const communityReports = [
    {
      id: 1,
      author: 'TechAnalyst_2024',
      date: '2025-01-06',
      rating: 'BUY',
      upvotes: 247,
      content: `Detailed analysis shows ${company.ticker} is undervalued. Strong balance sheet with D/E of ${company.ratios?.de_ratio?.toFixed(1)}. Expecting breakout above resistance.`
    },
    {
      id: 2,
      author: 'ValueInvestor',
      date: '2025-01-04',
      rating: 'HOLD',
      upvotes: 128,
      content: 'Fair valuation at current levels. Would wait for better entry point. Watch Fed rate decisions closely.'
    }
  ];

  const handleCreateReport = () => {
    console.log('Creating report:', newReport);
    alert('Report created successfully! (This would integrate with Trading Agent backend)');
    setNewReport({ title: '', content: '', rating: 'BUY' });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Report Type Tabs */}
      <div className="flex gap-2 border-b border-border-primary pb-2">
        {[
          { id: 'official', label: 'Official Reports' },
          { id: 'community', label: 'Community Reports' },
          { id: 'create', label: 'Create Report' }
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              reportType === type.id
                ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Official Reports */}
      {reportType === 'official' && (
        <div className="space-y-3">
          {officialReports.map(report => (
            <div key={report.id} className="p-4 bg-black rounded-lg border border-border-primary hover:border-accent-cyan/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-text-primary">{report.analyst}</h4>
                  <p className="text-xs text-text-tertiary">{report.date}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    report.rating === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    report.rating === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.rating}
                  </span>
                  <p className="text-xs text-text-secondary mt-1">Target: ${report.target.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">{report.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Community Reports */}
      {reportType === 'community' && (
        <div className="space-y-3">
          {communityReports.map(report => (
            <div key={report.id} className="p-4 bg-black rounded-lg border border-border-primary hover:border-accent-magenta/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-text-primary flex items-center gap-2">
                    {report.author}
                    <span className="text-accent-magenta text-xs">↑ {report.upvotes}</span>
                  </h4>
                  <p className="text-xs text-text-tertiary">{report.date}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  report.rating === 'BUY' ? 'bg-green-500/20 text-green-400' :
                  report.rating === 'SELL' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {report.rating}
                </span>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">{report.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Report */}
      {reportType === 'create' && (
        <div className="p-4 bg-black rounded-lg border border-border-primary">
          <h4 className="font-semibold text-text-primary mb-4">Create Analysis Report (Trading Agent)</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-2">Report Title</label>
              <input
                type="text"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-cyan"
                placeholder={`Analysis for ${company.ticker}`}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-2">Rating</label>
              <div className="flex gap-2">
                {['BUY', 'HOLD', 'SELL'].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setNewReport({ ...newReport, rating })}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                      newReport.rating === rating
                        ? rating === 'BUY' ? 'bg-green-500/30 text-green-400 border border-green-400' :
                          rating === 'SELL' ? 'bg-red-500/30 text-red-400 border border-red-400' :
                          'bg-yellow-500/30 text-yellow-400 border border-yellow-400'
                        : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-2">Analysis Content</label>
              <textarea
                value={newReport.content}
                onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                className="w-full bg-background-secondary border border-border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-cyan min-h-[120px]"
                placeholder="Enter your detailed analysis here..."
              />
            </div>
            <button
              onClick={handleCreateReport}
              className="w-full bg-accent-cyan hover:bg-accent-cyan/80 text-black font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Create Report with Trading Agent
            </button>
            <p className="text-xs text-text-tertiary text-center">
              This will use your Trading Agent to analyze {company.ticker} and generate a comprehensive report
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MacroImpactAnalysis = ({ company, macroVariables }: { company: Company, macroVariables: any }) => {
  const baseRate = 2.5;
  const rateChange = macroVariables.interestRate - baseRate;
  const { impact, explanation } = useMemo(() => {
    let impact = 0, explanation = "";
    if (company.sector === 'BANKING') {
      impact = rateChange * generateDeterministicMock(company.ticker, 2.5, 3.5);
      explanation = `A ${rateChange.toFixed(2)}% change in interest rates directly impacts Net Interest Margin (NIM).`;
    }
    else if (company.sector === 'REALESTATE') {
      impact = rateChange * generateDeterministicMock(company.ticker, -4.5, -5.5);
      explanation = `Real Estate companies are sensitive to borrowing costs. A ${rateChange.toFixed(2)}% rate change significantly impacts ICR and profitability.`;
    }
    else if (company.sector === 'MANUFACTURING') {
      impact = macroVariables.tariffRate * generateDeterministicMock(company.ticker, -0.4, -0.6);
      explanation = `Manufacturing sector is sensitive to trade tariffs. A tariff rate of ${macroVariables.tariffRate}% can increase costs.`;
    }
    else {
      explanation = "This sector has low direct sensitivity to the selected macro variables.";
    }
    return { impact: impact.toFixed(2), explanation };
  }, [company, macroVariables]);

  return (
    <div>
      <h4 className="font-bold text-text-primary mb-3">Scenario: Interest Rate at {macroVariables.interestRate.toFixed(1)}%, Tariff Rate at {macroVariables.tariffRate}%</h4>
      <div className={`p-4 rounded-lg ${parseFloat(impact) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
        <p className="text-sm text-text-secondary mb-2">Estimated Net Income Impact</p>
        <p className={`text-4xl font-bold ${parseFloat(impact) >= 0 ? 'text-status-safe' : 'text-status-danger'}`}>{impact}%</p>
        <p className="text-xs text-text-secondary mt-4">{explanation}</p>
      </div>
    </div>
  );
};

export default function PlatformDashboard() {
  // Zustand store for global macro state
  const macroState = useMacroStore(state => state.macroState);
  const updateMacroVariable = useMacroStore(state => state.updateMacroVariable);
  const calculatedImpacts = useMacroStore(state => state.calculatedImpacts);
  const calculateAdjustedFinancials = useMacroStore(state => state.calculateAdjustedFinancials);

  const [selectedCompany, setSelectedCompany] = useState<Company>(companies[0]);
  const [analysisTab, setAnalysisTab] = useState('Fundamental');
  const [searchTerm, setSearchTerm] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<MacroCategory>>(
    new Set(['MONETARY_POLICY'])
  );
  const [showAllVariables, setShowAllVariables] = useState<Set<MacroCategory>>(
    new Set()
  );

  const analysisTabs = ['Fundamental', 'Technical', 'Analysis Report'];
  const filteredCompanies = useMemo(() => companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.ticker.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

  const toggleCategory = (category: MacroCategory) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const toggleShowAllVariables = (category: MacroCategory) => {
    const newSet = new Set(showAllVariables);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setShowAllVariables(newSet);
  };

  const renderAnalysisContent = () => {
    switch(analysisTab) {
      case 'Fundamental': return <FundamentalAnalysis company={selectedCompany} />;
      case 'Technical': return <TechnicalAnalysis ticker={selectedCompany.ticker} />;
      case 'Analysis Report': return <AnalysisReport company={selectedCompany} />;
      default: return null;
    }
  }

  return (
    <div className="flex-1 bg-black text-text-primary flex flex-col">
      {/* Compact Header - Selected Company Info */}
      <div className="border-b border-border-primary px-6 py-2 bg-black/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Platform Dashboard</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-primary font-mono">{selectedCompany.name}</p>
            <p className="text-xs text-accent-cyan font-mono">{selectedCompany.ticker}</p>
          </div>
        </div>
      </div>

      {/* Main Content: 20% | 60% | 20% */}
      <div className="flex-1 flex gap-4 px-4 py-4 overflow-hidden">

        {/* LEFT SIDEBAR (20%) - Movers + Community */}
        <div className="w-[20%] min-w-0 flex flex-col gap-4">
          {/* Movers (Gainers/Losers) - max 400px */}
          <div className="max-h-[400px] flex-shrink-0">
            <Card className="h-full flex flex-col p-4">
              <Movers onSelectCompany={(stock) => {
                const company = companies.find(c => c.ticker === stock.ticker);
                if (company) setSelectedCompany(company);
              }} />
            </Card>
          </div>

          {/* Community Panel - max 400px */}
          <div className="max-h-[400px] flex-shrink-0">
            <CommunityPanel />
          </div>
        </div>

        {/* CENTER (60%) - Main Analysis: Ontology-Focused */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
          {/* Macro Impact Analysis with Controls */}
          <div className="h-[500px] max-h-[500px] flex-shrink-0">
            <Card className="h-full flex gap-4 p-4 overflow-hidden">
              {/* Left: Impact Display */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-text-primary mb-4">
                  Macro Impact Analysis
                </h3>
                <div className="space-y-4">
                  {/* Scenario Display - Key Variables */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-background-secondary rounded-lg p-2">
                      <div className="text-text-tertiary mb-1">Fed Rate</div>
                      <div className="text-accent-cyan font-mono font-semibold">
                        {macroState.fed_funds_rate?.toFixed(2) || 'N/A'}%
                      </div>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-2">
                      <div className="text-text-tertiary mb-1">US Tariff</div>
                      <div className="text-accent-magenta font-mono font-semibold">
                        {macroState.us_tariff_rate?.toFixed(0) || 'N/A'}%
                      </div>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-2">
                      <div className="text-text-tertiary mb-1">KRW/USD</div>
                      <div className="text-accent-emerald font-mono font-semibold">
                        {macroState.krw_usd?.toFixed(0) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Impact Result */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary mb-2">
                        Estimated Net Income Impact
                      </p>
                      {(() => {
                        // Get impact from store based on company sector
                        let impact = 0;

                        if (selectedCompany.sector === 'BANKING') {
                          impact = calculatedImpacts.banking;
                        } else if (selectedCompany.sector === 'REALESTATE') {
                          impact = calculatedImpacts.realEstate;
                        } else if (selectedCompany.sector === 'MANUFACTURING') {
                          impact = calculatedImpacts.manufacturing;
                        } else if (selectedCompany.sector === 'SEMICONDUCTOR') {
                          impact = calculatedImpacts.semiconductor;
                        }

                        return (
                          <p className={`text-4xl font-bold ${
                            impact >= 0 ? 'text-status-safe' : 'text-status-danger'
                          }`}>
                            {impact.toFixed(2)}%
                          </p>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-center p-4 bg-background-tertiary rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-text-secondary mb-2">Company</p>
                        <p className="text-sm font-semibold text-text-primary">
                          {selectedCompany.ticker}
                        </p>
                        <p className="text-xs text-accent-cyan mt-1">
                          {selectedCompany.sector}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Macro Controls */}
              <div className="w-[300px] border-l border-border-primary pl-4">
                <MacroControlPanel />
              </div>
            </Card>
          </div>

          {/* Live Price & Chart */}
          <div className="h-[400px] max-h-[400px] flex-shrink-0">
            <Card className="h-full flex flex-col p-4">
              {/* Live Price Indicator */}
              <LivePriceIndicator
                ticker={selectedCompany.ticker}
                currentPrice={selectedCompany.financials.equity / 200}
                previousClose={(selectedCompany.financials.equity / 200) * 0.99}
                onOpenAlert={() => setIsAlertModalOpen(true)}
              />

              {/* Divider */}
              <div className="border-b border-border-primary my-4"></div>

              {/* Price History Chart */}
              <div className="flex-1 min-h-0">
                <PriceHistoryChart
                  ticker={selectedCompany.ticker}
                  basePrice={selectedCompany.financials.equity / 200}
                  adjustedBasePrice={calculateAdjustedFinancials(selectedCompany).equity / 200}
                />
              </div>
            </Card>
          </div>

          {/* Fundamental & Technical & Analysis Report Tabs (Supplementary) - Remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Card className="h-full flex flex-col overflow-hidden p-4">
              <div className="flex gap-1 border-b border-border-primary pb-3 overflow-x-auto flex-shrink-0">
                {analysisTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAnalysisTab(tab)}
                    className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      analysisTab === tab
                        ? 'text-accent-cyan border-b-2 border-accent-cyan'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pt-3 text-xs pr-2">
                {renderAnalysisContent()}
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT SIDEBAR (20%) - Watchlist + Company List + News Feed */}
        <div className="w-[20%] min-w-0 flex flex-col gap-4">
          {/* Watchlist - max 300px */}
          <div className="max-h-[300px] flex-shrink-0">
            <Card className="h-full flex flex-col p-4">
              <Watchlist onSelectCompany={(stock) => {
                const company = companies.find(c => c.ticker === stock.ticker);
                if (company) setSelectedCompany(company);
              }} />
            </Card>
          </div>

          {/* Company List - max 400px */}
          <div className="max-h-[400px] flex-shrink-0">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardTitle className="text-xs mb-2 flex-shrink-0">Company List</CardTitle>
              <div className="relative mb-2 flex-shrink-0">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary"/>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-border-primary rounded-lg pl-6 pr-2 py-1 text-xs focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto pr-1 min-h-0">
                {filteredCompanies.map(company => (
                  <button
                    key={company.ticker}
                    onClick={() => setSelectedCompany(company)}
                    className={`w-full p-1.5 rounded text-left transition-all text-xs ${
                      selectedCompany.ticker === company.ticker ? 'bg-accent-cyan/10' : 'hover:bg-background-tertiary'
                    }`}
                  >
                    <div className="font-semibold text-text-primary">{company.ticker}</div>
                    <div className="text-text-secondary text-xs">{company.sector}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* News Feed - max 400px */}
          <div className="max-h-[400px] flex-shrink-0">
            <NewsFeed selectedSector={selectedCompany.sector} />
          </div>
        </div>
      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        ticker={selectedCompany.ticker}
        currentPrice={selectedCompany.financials.equity / 200}
      />
    </div>
  );
}
