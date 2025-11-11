'use client';

import React, { useState, useMemo } from 'react';
import { Users, Building2, TrendingUp, Network, AlertCircle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/DesignSystem';
import {
  ALL_SHAREHOLDERS,
  ALL_OWNERSHIP_STAKES,
  CROSS_HOLDINGS,
  NVIDIA_OWNERSHIP,
  TSMC_OWNERSHIP,
  SK_HYNIX_OWNERSHIP,
  SAMSUNG_OWNERSHIP,
  MICROSOFT_OWNERSHIP,
  calculateOwnershipConcentration,
  getTopShareholders,
  getInstitutionalOwnership,
  getInsiderOwnership,
  detectCircularOwnership,
  OwnershipStake,
  Shareholder,
} from '@/data/ownershipNetworks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Treemap } from 'recharts';

/**
 * Ownership Network Analyzer
 *
 * Visualize institutional holdings, insider ownership, cross-shareholding
 * Focus on chaebol structures and major investors
 */

type CompanyId = 'nvidia' | 'tsmc' | 'sk-hynix' | 'samsung' | 'microsoft';

const COMPANIES: Record<CompanyId, { name: string; stakes: OwnershipStake[] }> = {
  nvidia: { name: 'NVIDIA Corporation', stakes: NVIDIA_OWNERSHIP },
  tsmc: { name: 'TSMC', stakes: TSMC_OWNERSHIP },
  'sk-hynix': { name: 'SK Hynix', stakes: SK_HYNIX_OWNERSHIP },
  samsung: { name: 'Samsung Electronics', stakes: SAMSUNG_OWNERSHIP },
  microsoft: { name: 'Microsoft Corporation', stakes: MICROSOFT_OWNERSHIP },
};

const SHAREHOLDER_COLORS: Record<string, string> = {
  vanguard: '#00FF9F',
  blackrock: '#00E5FF',
  'state-street': '#C026D3',
  fidelity: '#FBBF24',
  jpmorgan: '#F97316',
  geode: '#8B5CF6',
  'norges-bank': '#3B82F6',
  'jen-hsun-huang': '#EF4444',
  'taiwan-government': '#10B981',
  'sk-group': '#06B6D4',
  'chey-family': '#EC4899',
  'lee-family': '#F59E0B',
  'samsung-life': '#6366F1',
  'bill-gates': '#14B8A6',
};

export default function OwnershipNetworkAnalyzer() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyId>('nvidia');
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);

  const companyStakes = COMPANIES[selectedCompany].stakes;
  const companyName = COMPANIES[selectedCompany].name;

  // Calculate ownership metrics
  const ownershipMetrics = useMemo(() => {
    const concentration = calculateOwnershipConcentration(companyStakes);
    const institutional = getInstitutionalOwnership(selectedCompany, companyStakes);
    const insider = getInsiderOwnership(selectedCompany, companyStakes);

    const top5 = getTopShareholders(selectedCompany, companyStakes, 5);
    const top5Total = top5.reduce((sum, s) => sum + s.percentOwnership, 0);

    return {
      concentration,
      institutional,
      insider,
      top5Total,
      float: 100 - institutional - insider,
    };
  }, [selectedCompany, companyStakes]);

  // Circular ownership detection
  const circularOwnership = useMemo(() => {
    return detectCircularOwnership(CROSS_HOLDINGS);
  }, []);

  // Ownership breakdown for pie chart
  const ownershipBreakdown = useMemo(() => {
    const top10 = getTopShareholders(selectedCompany, companyStakes, 10);
    const top10Total = top10.reduce((sum, s) => sum + s.percentOwnership, 0);
    const other = Math.max(0, 100 - top10Total);

    const data = top10.map((stake) => ({
      name: ALL_SHAREHOLDERS.find((sh) => sh.id === stake.shareholderId)?.name || stake.shareholderId,
      value: stake.percentOwnership,
      shareholderId: stake.shareholderId,
      shares: stake.shares,
      marketValue: stake.value,
    }));

    if (other > 0) {
      data.push({
        name: 'Other Investors',
        value: other,
        shareholderId: 'other',
        shares: 0,
        marketValue: 0,
      });
    }

    return data;
  }, [selectedCompany, companyStakes]);

  // Position changes (QoQ)
  const positionChanges = useMemo(() => {
    return companyStakes
      .filter((s) => s.changeQoQ !== undefined && s.changeQoQ !== 0)
      .sort((a, b) => Math.abs(b.changeQoQ!) - Math.abs(a.changeQoQ!))
      .map((stake) => ({
        name: ALL_SHAREHOLDERS.find((sh) => sh.id === stake.shareholderId)?.name || stake.shareholderId,
        change: stake.changeQoQ!,
        shareholderId: stake.shareholderId,
      }));
  }, [companyStakes]);

  // Cross-holdings for selected company
  const companyCrossHoldings = useMemo(() => {
    return CROSS_HOLDINGS.filter(
      (h) => h.from === selectedCompany || h.to === selectedCompany
    );
  }, [selectedCompany]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-accent-magenta" />
          <h2 className="text-lg font-bold text-text-primary">Ownership Network Analyzer</h2>
        </div>
        <div className="text-xs text-text-tertiary">13F Filings · Q2 2024</div>
      </div>

      {/* Company Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Select Company</h3>
          <div className="flex gap-2">
            {(Object.keys(COMPANIES) as CompanyId[]).map((companyId) => (
              <button
                key={companyId}
                onClick={() => setSelectedCompany(companyId)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  selectedCompany === companyId
                    ? 'bg-accent-cyan text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                {COMPANIES[companyId].name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Ownership Metrics */}
      <Card className="p-4 bg-gradient-to-br from-accent-magenta/5 to-accent-magenta/10 border-2 border-accent-magenta/30">
        <h3 className="text-sm font-semibold text-text-primary mb-3">{companyName} - Ownership Structure</h3>

        <div className="grid grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-text-tertiary mb-1">Institutional</div>
            <div className="text-2xl font-bold text-accent-cyan">{ownershipMetrics.institutional.toFixed(1)}%</div>
            <div className="text-xs text-text-secondary mt-1">Big 3: Vanguard, BlackRock, State Street</div>
          </div>

          <div>
            <div className="text-xs text-text-tertiary mb-1">Insider</div>
            <div className="text-2xl font-bold text-red-400">{ownershipMetrics.insider.toFixed(1)}%</div>
            <div className="text-xs text-text-secondary mt-1">Founders, executives, families</div>
          </div>

          <div>
            <div className="text-xs text-text-tertiary mb-1">Top 5 Holdings</div>
            <div className="text-2xl font-bold text-accent-emerald">{ownershipMetrics.top5Total.toFixed(1)}%</div>
            <div className="text-xs text-text-secondary mt-1">Concentration metric</div>
          </div>

          <div>
            <div className="text-xs text-text-tertiary mb-1">Public Float</div>
            <div className="text-2xl font-bold text-yellow-400">{ownershipMetrics.float.toFixed(1)}%</div>
            <div className="text-xs text-text-secondary mt-1">Freely tradable</div>
          </div>

          <div>
            <div className="text-xs text-text-tertiary mb-1">HHI Concentration</div>
            <div className={`text-2xl font-bold ${
              ownershipMetrics.concentration.hhi > 1800 ? 'text-red-400' :
              ownershipMetrics.concentration.hhi > 1000 ? 'text-yellow-400' :
              'text-accent-emerald'
            }`}>
              {ownershipMetrics.concentration.hhi.toFixed(0)}
            </div>
            <div className="text-xs text-text-secondary mt-1">{ownershipMetrics.concentration.classification}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Ownership Distribution */}
        <div className="space-y-4">
          {/* Ownership Pie Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Ownership Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ownershipBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name.split(' ')[0]} ${value.toFixed(1)}%`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ownershipBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SHAREHOLDER_COLORS[entry.shareholderId] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    const entry = props.payload;
                    return [
                      <>
                        <div>{value.toFixed(2)}% ownership</div>
                        {entry.shares > 0 && <div>{(entry.shares / 1000000).toFixed(1)}M shares</div>}
                        {entry.marketValue > 0 && <div>${(entry.marketValue / 1000).toFixed(1)}B value</div>}
                      </>,
                      name,
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Major Shareholders List */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Top 10 Shareholders</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {ownershipBreakdown.slice(0, 10).map((holder, idx) => {
                const shareholder = ALL_SHAREHOLDERS.find((sh) => sh.id === holder.shareholderId);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedShareholder(shareholder || null)}
                    className={`w-full text-left p-2 rounded transition-all ${
                      selectedShareholder?.id === holder.shareholderId
                        ? 'bg-accent-cyan/20 border border-accent-cyan'
                        : 'bg-background-secondary hover:bg-background-tertiary border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: SHAREHOLDER_COLORS[holder.shareholderId] || '#94A3B8' }}
                        />
                        <span className="text-xs font-medium text-text-primary">{holder.name}</span>
                      </div>
                      <span className="text-xs font-bold text-accent-cyan">{holder.value.toFixed(2)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-tertiary ml-5">
                      {holder.shares > 0 && <div>{(holder.shares / 1000000).toFixed(0)}M shares</div>}
                      {holder.marketValue > 0 && <div>${(holder.marketValue / 1000).toFixed(1)}B</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Analysis */}
        <div className="space-y-4">
          {/* Selected Shareholder Details */}
          {selectedShareholder ? (
            <Card className="p-4 border-2 border-accent-cyan/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{selectedShareholder.name}</h3>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${SHAREHOLDER_COLORS[selectedShareholder.id]}20`,
                    color: SHAREHOLDER_COLORS[selectedShareholder.id] || '#94A3B8',
                  }}
                >
                  {selectedShareholder.type}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {selectedShareholder.aum && (
                  <div className="bg-background-secondary rounded p-2">
                    <div className="text-xs text-text-tertiary">AUM</div>
                    <div className="text-sm font-bold text-accent-emerald">
                      ${(selectedShareholder.aum / 1000000).toFixed(1)}T
                    </div>
                  </div>
                )}
                {selectedShareholder.totalHoldings && (
                  <div className="bg-background-secondary rounded p-2">
                    <div className="text-xs text-text-tertiary">Total Holdings</div>
                    <div className="text-sm font-bold text-accent-cyan">
                      ${(selectedShareholder.totalHoldings / 1000).toFixed(0)}B
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-text-secondary mb-3">{selectedShareholder.description}</p>

              {/* Holdings across companies */}
              <div>
                <div className="text-xs font-semibold text-text-tertiary mb-2">Holdings:</div>
                <div className="space-y-1">
                  {ALL_OWNERSHIP_STAKES.filter((s) => s.shareholderId === selectedShareholder.id).map(
                    (stake, idx) => (
                      <div key={idx} className="text-xs p-2 bg-background-secondary rounded flex justify-between">
                        <span className="text-text-primary">{stake.companyName}</span>
                        <span className="text-accent-cyan font-mono">{stake.percentOwnership.toFixed(1)}%</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Building2 size={48} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-sm text-text-tertiary">Select a shareholder to view details</p>
            </Card>
          )}

          {/* Position Changes */}
          {positionChanges.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Position Changes (QoQ)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={positionChanges} layout="vertical" margin={{ left: 80, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                  <XAxis type="number" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94A3B8"
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1F',
                      border: '1px solid #27272E',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(value: any) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`}
                  />
                  <Bar dataKey="change">
                    {positionChanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.change > 0 ? '#00FF9F' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Cross-Holdings */}
          {companyCrossHoldings.length > 0 && (
            <Card className="p-4 bg-yellow-500/5 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Network size={16} className="text-yellow-400" />
                <h3 className="text-sm font-semibold text-text-primary">Cross-Shareholding</h3>
              </div>
              <div className="space-y-2">
                {companyCrossHoldings.map((holding, idx) => (
                  <div key={idx} className="bg-background-secondary rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-primary">
                        {ALL_SHAREHOLDERS.find((s) => s.id === holding.from)?.name} →{' '}
                        {ALL_SHAREHOLDERS.find((s) => s.id === holding.to)?.name}
                      </span>
                      <span className="text-xs font-bold text-yellow-400">{holding.ownership.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-text-tertiary">{holding.description}</div>
                    <div className="text-xs text-accent-emerald mt-1">${(holding.value / 1000).toFixed(1)}B</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Circular Ownership Warning */}
      {circularOwnership.circular && (
        <Card className="p-4 bg-red-500/5 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-400" />
            <h3 className="text-sm font-semibold text-text-primary">Circular Ownership Detected</h3>
          </div>
          <p className="text-xs text-text-secondary mb-2">
            Circular cross-shareholding structures found. Common in Korean chaebols (e.g., Samsung) and Japanese keiretsu.
            These structures allow controlling shareholders to maintain control with minimal equity ownership.
          </p>
          <div className="space-y-1">
            {circularOwnership.cycles.map((cycle, idx) => (
              <div key={idx} className="text-xs p-2 bg-background-secondary rounded text-text-primary">
                <strong>Cycle:</strong> {cycle.join(' → ')}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Footer */}
      <Card className="p-3 bg-background-secondary">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="font-semibold text-accent-cyan mb-1">Institutional Ownership</div>
            <div className="text-text-tertiary">
              Vanguard, BlackRock, State Street are largest asset managers. Own 5-8% of most major US companies through
              index funds. Long-term passive holders.
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-magenta mb-1">Insider Ownership</div>
            <div className="text-text-tertiary">
              Founders, executives, and families. High insider ownership often signals alignment with shareholders. Low
              insider ownership can indicate mature company or founder exits.
            </div>
          </div>
          <div>
            <div className="font-semibold text-yellow-400 mb-1">Cross-Shareholding</div>
            <div className="text-text-tertiary">
              Common in Korean chaebols (Samsung, SK, Hyundai). Companies and affiliates own each other. Strengthens
              family control despite low direct ownership. Can reduce corporate governance.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
