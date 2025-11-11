'use client';

import React, { useState, useMemo } from 'react';
import { Network, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Package, Users, Globe } from 'lucide-react';
import { Card } from '@/components/ui/DesignSystem';
import {
  ALL_SUPPLY_CHAIN_ENTITIES,
  SUPPLY_CHAIN_LINKS,
  SUPPLY_CHAIN_BOTTLENECKS,
  MARKET_DYNAMICS,
  GEOPOLITICAL_RISKS,
  calculateSupplyChainHealth,
  SupplyChainEntity,
  SupplyChainLink,
} from '@/data/nvidiaSupplyChain';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Supply Chain Analyzer
 *
 * Visualize and analyze NVIDIA's AI chip supply chain
 * Real-world data on suppliers, customers, bottlenecks, and risks
 */

const COLORS = {
  company: '#00FF9F',
  product: '#00E5FF',
  component: '#C026D3',
  customer: '#FBBF24',
  service: '#94A3B8',
};

export default function SupplyChainAnalyzer() {
  const [selectedEntity, setSelectedEntity] = useState<SupplyChainEntity | null>(null);
  const [hbmAvailability, setHbmAvailability] = useState(0.6); // 60% of demand met
  const [cowosCapacity, setCowosCapacity] = useState(0.7); // 70% capacity
  const [waferAllocation, setWaferAllocation] = useState(0.8); // 80% allocation
  const [geopoliticalStability, setGeopoliticalStability] = useState(0.85); // 85% stable

  // Calculate supply chain health
  const health = useMemo(() => {
    return calculateSupplyChainHealth(
      hbmAvailability,
      cowosCapacity,
      waferAllocation,
      geopoliticalStability
    );
  }, [hbmAvailability, cowosCapacity, waferAllocation, geopoliticalStability]);

  // Group entities by type
  const entitiesByType = useMemo(() => {
    const groups: Record<string, SupplyChainEntity[]> = {
      company: [],
      product: [],
      component: [],
      customer: [],
    };

    ALL_SUPPLY_CHAIN_ENTITIES.forEach((entity) => {
      if (groups[entity.type]) {
        groups[entity.type].push(entity);
      }
    });

    return groups;
  }, []);

  // Critical suppliers data for chart
  const supplierData = useMemo(() => {
    return [
      { name: 'TSMC', dependencyScore: 95, marketShare: 100, revenue: 69300 },
      { name: 'SK Hynix', dependencyScore: 90, marketShare: 50, revenue: 36700 },
      { name: 'Samsung', dependencyScore: 50, marketShare: 30, revenue: 234000 },
      { name: 'Micron', dependencyScore: 30, marketShare: 15, revenue: 15537 },
    ];
  }, []);

  // Customer revenue distribution
  const customerData = useMemo(() => {
    return [
      { name: 'Microsoft', value: 10000 },
      { name: 'Meta', value: 9000 },
      { name: 'Google', value: 4000 },
      { name: 'Amazon', value: 3500 },
      { name: 'Others', value: 8500 },
    ];
  }, []);

  // Find related links for selected entity
  const relatedLinks = useMemo(() => {
    if (!selectedEntity) return [];
    return SUPPLY_CHAIN_LINKS.filter(
      (link) => link.from === selectedEntity.id || link.to === selectedEntity.id
    );
  }, [selectedEntity]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-accent-cyan" />
          <h2 className="text-lg font-bold text-text-primary">NVIDIA AI Supply Chain Analyzer</h2>
        </div>
        <div className="text-xs text-text-tertiary">Real-world data · 2024</div>
      </div>

      {/* Supply Chain Health */}
      <Card className={`p-4 border-2 ${
        health.status === 'Healthy' ? 'border-accent-emerald/30 bg-accent-emerald/5' :
        health.status === 'Constrained' ? 'border-yellow-500/30 bg-yellow-500/5' :
        health.status === 'Critical' ? 'border-orange-500/30 bg-orange-500/5' :
        'border-red-500/30 bg-red-500/5'
      }`}>
        <div className="grid grid-cols-5 gap-4">
          {/* Overall Health */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className={
                health.status === 'Healthy' ? 'text-accent-emerald' :
                health.status === 'Constrained' ? 'text-yellow-400' :
                health.status === 'Critical' ? 'text-orange-400' :
                'text-red-400'
              } />
              <h3 className="text-sm font-semibold text-text-primary">Supply Chain Health</h3>
            </div>
            <div className={`text-4xl font-bold mb-1 ${
              health.status === 'Healthy' ? 'text-accent-emerald' :
              health.status === 'Constrained' ? 'text-yellow-400' :
              health.status === 'Critical' ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {(health.score * 100).toFixed(0)}
            </div>
            <div className="text-xs text-text-tertiary">{health.status}</div>
          </div>

          {/* Health Factors */}
          <div className="col-span-4 grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>HBM3E Availability</span>
                <span className="text-accent-magenta font-mono">{(hbmAvailability * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={hbmAvailability}
                onChange={(e) => setHbmAvailability(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-text-tertiary mt-1">Primary bottleneck</div>
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>CoWoS Capacity</span>
                <span className="text-accent-cyan font-mono">{(cowosCapacity * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={cowosCapacity}
                onChange={(e) => setCowosCapacity(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-text-tertiary mt-1">TSMC packaging</div>
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Wafer Allocation</span>
                <span className="text-accent-emerald font-mono">{(waferAllocation * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={waferAllocation}
                onChange={(e) => setWaferAllocation(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-text-tertiary mt-1">4nm capacity</div>
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 flex items-center justify-between">
                <span>Geopolitical Stability</span>
                <span className="text-yellow-400 font-mono">{(geopoliticalStability * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={geopoliticalStability}
                onChange={(e) => setGeopoliticalStability(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-text-tertiary mt-1">Taiwan risk</div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border-primary text-xs text-text-secondary">
          <strong>Primary Bottleneck:</strong> {health.bottleneck} · <strong>H100 Production Estimate:</strong>{' '}
          {(MARKET_DYNAMICS.h100Supply * (hbmAvailability + cowosCapacity) / 2 / 1000000).toFixed(2)}M units/year
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Entity Explorer */}
        <div className="space-y-4">
          {/* Key Suppliers */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Critical Suppliers</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={supplierData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272E" />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="dependencyScore" fill="#EF4444" name="Dependency Score" />
                <Bar dataKey="marketShare" fill="#00E5FF" name="Market Share %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Supply Chain Entities */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Supply Chain Entities</h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(entitiesByType).map(([type, entities]) => (
                <div key={type}>
                  <div className="text-xs font-semibold text-text-tertiary mb-2 uppercase">{type}s</div>
                  <div className="space-y-1">
                    {entities.map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntity(entity)}
                        className={`w-full text-left p-2 rounded transition-all ${
                          selectedEntity?.id === entity.id
                            ? 'bg-accent-cyan/20 border border-accent-cyan'
                            : 'bg-background-secondary hover:bg-background-tertiary border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-text-primary">{entity.name}</span>
                          {entity.ticker && (
                            <span className="text-xs text-accent-cyan font-mono">{entity.ticker}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-text-tertiary">
                          {entity.revenue && <div>Rev: ${(entity.revenue / 1000).toFixed(0)}B</div>}
                          {entity.marketShare && <div>Share: {entity.marketShare.toFixed(0)}%</div>}
                          {entity.dependencyScore && (
                            <div className="text-red-400">Dep: {entity.dependencyScore}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Details & Analysis */}
        <div className="space-y-4">
          {/* Selected Entity Details */}
          {selectedEntity ? (
            <Card className="p-4 border-2 border-accent-cyan/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{selectedEntity.name}</h3>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: `${COLORS[selectedEntity.type]}20`, color: COLORS[selectedEntity.type] }}
                >
                  {selectedEntity.type}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {selectedEntity.revenue && (
                  <div className="bg-background-secondary rounded p-2">
                    <div className="text-xs text-text-tertiary">Revenue</div>
                    <div className="text-sm font-bold text-accent-emerald">
                      ${(selectedEntity.revenue / 1000).toFixed(1)}B
                    </div>
                  </div>
                )}
                {selectedEntity.marketShare && (
                  <div className="bg-background-secondary rounded p-2">
                    <div className="text-xs text-text-tertiary">Market Share</div>
                    <div className="text-sm font-bold text-accent-cyan">{selectedEntity.marketShare.toFixed(0)}%</div>
                  </div>
                )}
                {selectedEntity.dependencyScore && (
                  <div className="bg-background-secondary rounded p-2">
                    <div className="text-xs text-text-tertiary">Dependency</div>
                    <div className="text-sm font-bold text-red-400">{selectedEntity.dependencyScore}/100</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary mb-3">{selectedEntity.description}</p>

              {/* Key Products */}
              {selectedEntity.keyProducts && selectedEntity.keyProducts.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-text-tertiary mb-1">Key Products:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntity.keyProducts.map((product) => (
                      <span
                        key={product}
                        className="text-xs px-2 py-0.5 rounded bg-background-tertiary text-text-primary"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Links */}
              {relatedLinks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-text-tertiary mb-2">Relationships ({relatedLinks.length}):</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {relatedLinks.map((link, idx) => (
                      <div key={idx} className="text-xs p-2 bg-background-secondary rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-text-primary">
                            {link.from === selectedEntity.id
                              ? `→ ${ALL_SUPPLY_CHAIN_ENTITIES.find((e) => e.id === link.to)?.name}`
                              : `← ${ALL_SUPPLY_CHAIN_ENTITIES.find((e) => e.id === link.from)?.name}`}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              link.criticality === 'critical'
                                ? 'bg-red-500/20 text-red-400'
                                : link.criticality === 'important'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-accent-cyan/20 text-accent-cyan'
                            }`}
                          >
                            {link.criticality}
                          </span>
                        </div>
                        <div className="text-text-tertiary">{link.description}</div>
                        {link.annualValue && (
                          <div className="text-accent-emerald mt-1">${(link.annualValue / 1000).toFixed(1)}B annual</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Package size={48} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-sm text-text-tertiary">Select an entity to view details</p>
            </Card>
          )}

          {/* Customer Distribution */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Customer Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1F',
                    border: '1px solid #27272E',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => `$${(value / 1000).toFixed(1)}B`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Market Dynamics */}
          <Card className="p-4 bg-background-secondary">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Market Dynamics (2024)</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-text-tertiary mb-1">H100 Demand</div>
                <div className="text-lg font-bold text-accent-emerald">
                  {(MARKET_DYNAMICS.h100Demand / 1000000).toFixed(1)}M units
                </div>
              </div>
              <div>
                <div className="text-text-tertiary mb-1">H100 Supply</div>
                <div className="text-lg font-bold text-accent-cyan">
                  {(MARKET_DYNAMICS.h100Supply / 1000000).toFixed(1)}M units
                </div>
              </div>
              <div>
                <div className="text-text-tertiary mb-1">Supply Gap</div>
                <div className="text-lg font-bold text-red-400">
                  {(MARKET_DYNAMICS.supplyGap / 1000000).toFixed(1)}M shortage
                </div>
              </div>
              <div>
                <div className="text-text-tertiary mb-1">Lead Time</div>
                <div className="text-lg font-bold text-yellow-400">{MARKET_DYNAMICS.leadTimes.order_to_delivery} weeks</div>
              </div>
              <div className="col-span-2">
                <div className="text-text-tertiary mb-1">Gray Market Premium</div>
                <div className="text-sm text-text-primary">
                  List: ${(MARKET_DYNAMICS.pricing.h100_list_price / 1000).toFixed(0)}K → Gray Market: $
                  {(MARKET_DYNAMICS.pricing.h100_gray_market / 1000).toFixed(0)}K (
                  <span className="text-red-400">+{MARKET_DYNAMICS.pricing.premium_vs_list}%</span>)
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottlenecks */}
      <Card className="p-4 bg-red-500/5 border border-red-500/30">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-sm font-semibold text-text-primary">Supply Chain Bottlenecks</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SUPPLY_CHAIN_BOTTLENECKS.map((bottleneck, idx) => (
            <div key={idx} className="bg-background-secondary rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-text-primary">{bottleneck.component}</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    bottleneck.severity === 'Critical'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {bottleneck.severity}
                </span>
              </div>
              <p className="text-xs text-text-tertiary mb-2">{bottleneck.description}</p>
              <div className="text-xs text-text-secondary">
                <div>
                  <strong>Impact:</strong> {bottleneck.impact}
                </div>
                <div>
                  <strong>Lead Time:</strong> {bottleneck.leadTime} months
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Geopolitical Risks */}
      <Card className="p-4 bg-yellow-500/5 border border-yellow-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-text-primary">Geopolitical Risks</h3>
        </div>
        <div className="space-y-2">
          {GEOPOLITICAL_RISKS.map((risk, idx) => (
            <div key={idx} className="bg-background-secondary rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-text-primary">{risk.risk}</h4>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">{risk.impact}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                    {risk.probability}
                  </span>
                </div>
              </div>
              <p className="text-xs text-text-tertiary mb-2">{risk.description}</p>
              <div className="text-xs text-accent-cyan">
                <strong>Mitigation:</strong> {risk.mitigation}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
