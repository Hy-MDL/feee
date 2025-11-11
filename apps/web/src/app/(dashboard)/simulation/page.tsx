'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Settings, Globe, Network, Zap, Play, Save, Users, Sparkles, ChevronDown, ChevronUp, Info, GitBranch } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui/DesignSystem';
import { useMacroStore } from '@/lib/store/macroStore';
import { useLevelStore } from '@/lib/store/levelStore';
import { useScenarioStore } from '@/lib/store/scenarioStore';
import { MACRO_CATEGORIES, MACRO_VARIABLES } from '@/data/macroVariables';
import LevelControlPanel from '@/components/simulation/LevelControlPanel';
import SupplyChainDiagram, { HBM_SUPPLY_CHAIN } from '@/components/visualization/SupplyChainDiagram';
import CascadeEffects from '@/components/simulation/CascadeEffects';
import SimulationTimeline from '@/components/simulation/SimulationTimeline';
import DateSimulator from '@/components/simulation/DateSimulator';
import { DateSnapshot } from '@/lib/utils/dateBasedSimulation';
import {
  FED_RATE_THEME,
  AI_BOOM_THEME,
  TRADE_WAR_THEME,
  M2_LIQUIDITY_THEME,
} from '@/data/supplyChainThemes';
import ScenarioMarket from '@/components/platform/ScenarioMarket';

// Dynamic imports
const Globe3D = dynamic(() => import('@/components/visualization/Globe3D'), { ssr: false });
const ForceNetworkGraph3D = dynamic(() => import('@/components/visualization/ForceNetworkGraph3D'), { ssr: false });

type Sector = 'BANKING' | 'REALESTATE' | 'MANUFACTURING' | 'SEMICONDUCTOR' | null;

interface MacroControl {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

// Historical Scenarios
const SCENARIOS = [
  {
    id: '2008-financial-crisis',
    name: '2008 Financial Crisis',
    date: '2008-09-15',
    description: 'Lehman Brothers collapse and global financial meltdown',
    icon: '📉',
    settings: {
      fed_funds_rate: 2.0,
      us_10y_yield: 3.5,
      us_gdp_growth: -2.8,
      us_m2_money_supply: 8.5,
      wti_oil: 145,
      vix: 45
    }
  },
  {
    id: '2020-pandemic',
    name: '2020 COVID-19 Pandemic',
    date: '2020-03-15',
    description: 'Market crash and unprecedented Fed intervention',
    icon: '🦠',
    settings: {
      fed_funds_rate: 0.25,
      us_10y_yield: 0.7,
      us_gdp_growth: -3.4,
      us_m2_money_supply: 19.2,
      wti_oil: 20,
      vix: 82
    }
  },
  {
    id: '2022-inflation',
    name: '2022 Inflation Surge',
    date: '2022-06-15',
    description: 'Fed aggressive rate hikes to combat 40-year high inflation',
    icon: '📈',
    settings: {
      fed_funds_rate: 1.75,
      us_10y_yield: 3.2,
      us_gdp_growth: 1.6,
      us_m2_money_supply: 21.7,
      wti_oil: 120,
      vix: 28
    }
  },
  {
    id: 'baseline',
    name: 'Current Baseline',
    date: new Date().toISOString().split('T')[0],
    description: 'Normal market conditions',
    icon: '⚖️',
    settings: {
      fed_funds_rate: 5.25,
      us_10y_yield: 4.5,
      us_gdp_growth: 2.5,
      us_m2_money_supply: 21.4,
      wti_oil: 85,
      vix: 18.5
    }
  }
];

export default function SimulationPage() {
  const [selectedSector, setSelectedSector] = useState<Sector>(null);
  const [viewMode, setViewMode] = useState<'split' | 'globe' | 'network' | 'supply-chain'>('split');
  const [globeViewMode, setGlobeViewMode] = useState<'companies' | 'flows' | 'm2'>('companies');
  const [supplyChainTheme, setSupplyChainTheme] = useState<'fed_rate' | 'ai_boom' | 'trade_war' | 'm2'>('ai_boom');
  const [showElementLibrary, setShowElementLibrary] = useState(false);
  const [showScenarios, setShowScenarios] = useState(true); // Open by default
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [macroChanging, setMacroChanging] = useState(false);
  const [changedMacroId, setChangedMacroId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<DateSnapshot | null>(null);

  const macroState = useMacroStore(state => state.macroState);
  const updateMacroVariable = useMacroStore(state => state.updateMacroVariable);
  const calculatedImpacts = useMacroStore(state => state.calculatedImpacts);

  const levelState = useLevelStore(state => state.levelState);
  const updateLevelControl = useLevelStore(state => state.updateLevelControl);

  const { saveScenario, loadScenario, getAllScenarios } = useScenarioStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');

  // Key macro controls (using correct variable IDs from macroVariables.ts)
  const macroControls: MacroControl[] = [
    {
      id: 'fed_funds_rate',
      label: 'Fed Funds Rate',
      value: macroState['fed_funds_rate'] || 5.25,
      min: 0,
      max: 10,
      step: 0.25,
      unit: '%'
    },
    {
      id: 'us_10y_yield',
      label: 'US 10Y Treasury',
      value: macroState['us_10y_yield'] || 4.5,
      min: 0,
      max: 10,
      step: 0.1,
      unit: '%'
    },
    {
      id: 'us_gdp_growth',
      label: 'US GDP Growth',
      value: macroState['us_gdp_growth'] || 2.5,
      min: -5,
      max: 7,
      step: 0.1,
      unit: '%'
    },
    {
      id: 'us_m2_money_supply',
      label: 'US M2 Supply',
      value: macroState['us_m2_money_supply'] || 21.4,
      min: 10,
      max: 40,
      step: 0.5,
      unit: 'T'
    },
    {
      id: 'wti_oil',
      label: 'WTI Oil Price',
      value: macroState['wti_oil'] || 85,
      min: 20,
      max: 200,
      step: 5,
      unit: '$'
    },
    {
      id: 'vix',
      label: 'VIX Volatility',
      value: macroState['vix'] || 18.5,
      min: 5,
      max: 80,
      step: 1,
      unit: ''
    }
  ];

  const handleMacroChange = (id: string, value: number) => {
    setMacroChanging(true);
    setChangedMacroId(id);

    // Clear active scenario when user manually adjusts
    if (activeScenario) {
      setActiveScenario(null);
    }

    // Update macro variable with actual value (no conversion needed)
    updateMacroVariable(id, value);

    // Reset bright effect after animation
    setTimeout(() => {
      setMacroChanging(false);
      setChangedMacroId(null);
    }, 1000);
  };

  const applyScenario = (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    setActiveScenario(scenarioId);
    setSelectedDate(scenario.date);
    setMacroChanging(true);

    // Apply all scenario settings
    Object.entries(scenario.settings).forEach(([key, value]) => {
      updateMacroVariable(key, value);
    });

    setTimeout(() => {
      setMacroChanging(false);
    }, 1500);
  };

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    const scenarioId = saveScenario({
      name: scenarioName,
      description: scenarioDescription || 'Custom scenario',
      icon: '💾',
      macroState,
      levelState,
      createdBy: 'user', // In real app, use actual user ID
      isPublic: false,
      tags: ['custom'],
    });

    setScenarioName('');
    setScenarioDescription('');
    setShowSaveDialog(false);
    alert(`Scenario "${scenarioName}" saved successfully!`);
  };

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = loadScenario(scenarioId);
    if (!scenario) return;

    setMacroChanging(true);

    // Apply macro state
    Object.entries(scenario.macroState).forEach(([key, value]) => {
      updateMacroVariable(key, value);
    });

    // Apply level state if available
    if (scenario.levelState) {
      Object.entries(scenario.levelState).forEach(([controlId, value]) => {
        updateLevelControl(controlId, value);
      });
    }

    setShowLoadDialog(false);
    setTimeout(() => {
      setMacroChanging(false);
    }, 1500);
  };

  const sectors = [
    { id: 'BANKING', label: 'Banking', color: '#06B6D4', icon: '🏦', impact: calculatedImpacts.banking },
    { id: 'REALESTATE', label: 'Real Estate', color: '#00FF9F', icon: '🏢', impact: calculatedImpacts.realEstate },
    { id: 'MANUFACTURING', label: 'Manufacturing', color: '#8B5CF6', icon: '🏭', impact: calculatedImpacts.manufacturing },
    { id: 'SEMICONDUCTOR', label: 'Semiconductor', color: '#F59E0B', icon: '💻', impact: calculatedImpacts.semiconductor },
    { id: 'CRYPTO', label: 'Crypto', color: '#E6007A', icon: '₿', impact: calculatedImpacts.crypto }
  ];

  return (
    <div className="relative min-h-screen bg-black text-text-primary overflow-hidden">
      {/* Header */}
      <div className="relative z-10 border-b border-border-primary bg-black/80 backdrop-blur">
        <SectionHeader
          title="Economic Simulation Platform"
          subtitle="Unified Globe + Network Graph with Macro Control & Scenario Testing"
          icon={<Sparkles size={24} />}
        />
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Sector Focus */}
        <div className="w-64 border-r border-border-primary bg-black/50 backdrop-blur p-4 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-accent-cyan" />
              <h3 className="text-sm font-semibold text-text-primary">Sector Focus</h3>
            </div>
            <p className="text-xs text-text-tertiary mb-3">
              Select a sector to highlight related elements in both Globe and Network Graph
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedSector(null)}
                className={`w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedSector === null
                    ? 'bg-accent-cyan text-black font-semibold shadow-lg shadow-accent-cyan/50'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🌍</span>
                  <span className="text-sm">All Sectors (Overall)</span>
                </div>
              </button>

              {sectors.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id as Sector)}
                  className={`w-full px-3 py-2.5 rounded-lg text-left transition-all border ${
                    selectedSector === sector.id
                      ? 'border-accent-cyan bg-accent-cyan/10 shadow-lg shadow-accent-cyan/20'
                      : 'border-border-primary bg-background-secondary hover:border-accent-cyan/50'
                  }`}
                  style={{
                    borderColor: selectedSector === sector.id ? sector.color : undefined
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sector.icon}</span>
                      <span className="text-sm font-medium text-text-primary">{sector.label}</span>
                    </div>
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        sector.impact >= 0 ? 'bg-status-safe/20 text-status-safe' : 'bg-status-danger/20 text-status-danger'
                      }`}
                    >
                      {sector.impact >= 0 ? '+' : ''}{sector.impact.toFixed(1)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Macro Controller */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-accent-magenta" />
              <h3 className="text-sm font-semibold text-text-primary">Macro Controller</h3>
            </div>
            <p className="text-xs text-text-tertiary mb-3">
              Adjust variables to see real-time impact
            </p>

            <div className="space-y-4">
              {macroControls.map(control => (
                <div key={control.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-secondary">{control.label}</label>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      changedMacroId === control.id && macroChanging
                        ? 'bg-accent-cyan text-black animate-pulse'
                        : 'bg-background-tertiary text-accent-cyan'
                    }`}>
                      {control.value.toFixed(2)}{control.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={(e) => handleMacroChange(control.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                    style={{
                      background: changedMacroId === control.id && macroChanging
                        ? 'linear-gradient(90deg, #00E5FF 0%, #E6007A 100%)'
                        : undefined
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Legend - Globe Style */}
          <div className="mb-6">
            <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-accent-cyan" />
                <div className="text-xs text-text-tertiary font-semibold">Legend</div>
              </div>
              {globeViewMode === 'm2' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-cyan shadow-lg" style={{ boxShadow: '0 0 10px #00E5FF' }} />
                    <span className="text-xs text-text-primary">Point Size = M2 Supply</span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-2">
                    Larger = More Money Supply
                  </div>
                </div>
              ) : globeViewMode === 'flows' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-accent-cyan to-transparent" />
                    <span className="text-xs text-text-primary">Static Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-accent-emerald to-transparent shadow-lg" style={{ boxShadow: '0 0 8px #00FF9F' }} />
                    <span className="text-xs text-accent-emerald font-semibold">⚡ Macro Impact</span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-2">
                    Brighter arcs = Higher macro variable impact
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-emerald shadow-lg" style={{ boxShadow: '0 0 10px #00FF9F' }} />
                    <span className="text-xs text-text-primary">Companies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-accent-emerald to-transparent shadow-lg" style={{ boxShadow: '0 0 8px #00FF9F' }} />
                    <span className="text-xs text-accent-emerald font-semibold">⚡ Macro Impact</span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-2">
                    Arcs show macro variable effects on sectors
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Macro Impacts - Globe Style */}
          {Object.values(calculatedImpacts).some(v => Math.abs(v) > 0) && (
            <div className="mb-6">
              <div className="bg-black/80 backdrop-blur border-2 border-accent-emerald rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                  <div className="text-xs font-bold text-accent-emerald">Active Macro Impacts</div>
                </div>
                <div className="space-y-1 text-xs">
                  {macroControls
                    .map(control => {
                      // Calculate impact based on deviation from baseline
                      const baseline = {
                        'fed_funds_rate': 5.25,
                        'us_10y_yield': 4.5,
                        'us_gdp_growth': 2.5,
                        'us_m2_money_supply': 21.4,
                        'wti_oil': 85,
                        'vix': 18.5
                      }[control.id] || 0;
                      const deviation = Math.abs((control.value - baseline) / baseline);
                      return { ...control, impact: deviation };
                    })
                    .filter(control => control.impact > 0.05)
                    .slice(0, 5)
                    .map(control => (
                      <div key={control.id} className="flex justify-between items-center">
                        <span className="text-text-tertiary truncate max-w-[140px]">{control.label}:</span>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-1 bg-gradient-to-r from-accent-emerald to-transparent rounded"
                            style={{ width: `${Math.min(control.impact * 100, 40)}px` }}
                          />
                          <span className="text-accent-emerald font-mono">{(control.impact * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  {macroControls.every(c => {
                    const baseline = {
                      'fed_funds_rate': 5.25,
                      'us_10y_yield': 4.5,
                      'us_gdp_growth': 2.5,
                      'us_m2_money_supply': 21.4,
                      'wti_oil': 85,
                      'vix': 18.5
                    }[c.id] || 0;
                    return Math.abs((c.value - baseline) / baseline) <= 0.05;
                  }) && (
                    <div className="text-text-tertiary text-xs italic">
                      Adjust macro variables above to see impacts
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Level Controls Toggle */}
          {/* Time-Based Simulation */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-accent-emerald" />
                <span className="text-sm font-semibold text-text-primary">
                  Date Simulation
                </span>
              </div>
              <DateSimulator onSnapshotChange={setCurrentSnapshot} />
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20
                border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-indigo-500/30
                transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-text-primary">
                  Advanced Level Controls
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary">
                  {showAdvancedControls ? 'Hide' : 'Show'} 9-Level Controls
                </span>
                {showAdvancedControls ? (
                  <ChevronUp size={16} className="text-text-tertiary group-hover:text-purple-400 transition-colors" />
                ) : (
                  <ChevronDown size={16} className="text-text-tertiary group-hover:text-purple-400 transition-colors" />
                )}
              </div>
            </button>

            {/* Level Control Panel */}
            {showAdvancedControls && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                <LevelControlPanel
                  onControlChange={(level, controlId, value) => {
                    console.log(`Level ${level} - ${controlId}: ${value}`);
                    updateLevelControl(controlId, value);
                  }}
                />
              </div>
            )}
          </div>

          {/* View Mode */}
          <div>
            <h3 className="text-xs font-semibold text-text-tertiary mb-2">View Layout</h3>
            <div className="space-y-1">
              <button
                onClick={() => setViewMode('split')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-accent-cyan text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                Split View (Globe + Network)
              </button>
              <button
                onClick={() => setViewMode('globe')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'globe'
                    ? 'bg-accent-emerald text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <Globe size={12} className="inline mr-1" />
                Globe Only
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'network'
                    ? 'bg-accent-magenta text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <Network size={12} className="inline mr-1" />
                Network Only
              </button>
              <button
                onClick={() => setViewMode('supply-chain')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  viewMode === 'supply-chain'
                    ? 'bg-purple-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <GitBranch size={12} className="inline mr-1" />
                Supply Chain
              </button>
            </div>
          </div>

          {/* Globe View Mode */}
          <div>
            <h3 className="text-xs font-semibold text-text-tertiary mb-2">Globe Display</h3>
            <div className="space-y-1">
              <button
                onClick={() => setGlobeViewMode('companies')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeViewMode === 'companies'
                    ? 'bg-accent-cyan text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                🏢 Companies
              </button>
              <button
                onClick={() => setGlobeViewMode('flows')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeViewMode === 'flows'
                    ? 'bg-accent-emerald text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                💸 Cash Flows
              </button>
              <button
                onClick={() => setGlobeViewMode('m2')}
                className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  globeViewMode === 'm2'
                    ? 'bg-accent-magenta text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                💰 M2 Liquidity
              </button>
            </div>
          </div>
        </div>

        {/* Center - Visualization */}
        <div className="flex-1 relative">
          {/* Bright effect overlay when macro changing */}
          {macroChanging && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-radial from-accent-cyan/20 via-transparent to-transparent animate-pulse" />
            </div>
          )}

          {viewMode === 'split' && (
            <div className="grid grid-cols-2 h-full w-full">
              <div className="border-r border-border-primary relative h-full w-full">
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur border border-accent-cyan rounded px-2 py-1">
                  <span className="text-xs font-semibold text-accent-cyan">
                    Globe 3D - {globeViewMode === 'companies' ? 'Companies' : globeViewMode === 'flows' ? 'Cash Flows' : 'M2 Liquidity'}
                  </span>
                </div>
                {/* Date Legend - Top Right */}
                {currentSnapshot && (
                  <div className="absolute top-4 right-4 z-10 bg-black/95 backdrop-blur-md border-2 border-accent-emerald/50 rounded-lg px-4 py-3 shadow-2xl shadow-emerald-500/20">
                    <div className="text-xs text-text-tertiary mb-1 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                      SIMULATION TIME
                    </div>
                    <div className="text-2xl font-bold text-accent-emerald font-mono">
                      {currentSnapshot.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-text-secondary mt-1 flex items-center justify-between">
                      <span>{currentSnapshot.events.length} events</span>
                      <span className="text-accent-cyan">●</span>
                    </div>
                  </div>
                )}
                <Globe3D selectedSector={selectedSector} showControls={false} viewMode={globeViewMode} snapshot={currentSnapshot} />
              </div>
              <div className="relative h-full w-full">
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur border border-accent-magenta rounded px-2 py-1">
                  <span className="text-xs font-semibold text-accent-magenta">Network Graph - Relationships</span>
                </div>
                {/* Date Legend - Top Right */}
                {currentSnapshot && (
                  <div className="absolute top-4 right-4 z-10 bg-black/95 backdrop-blur-md border-2 border-accent-emerald/50 rounded-lg px-4 py-3 shadow-2xl shadow-emerald-500/20">
                    <div className="text-xs text-text-tertiary mb-1 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                      SIMULATION TIME
                    </div>
                    <div className="text-2xl font-bold text-accent-emerald font-mono">
                      {currentSnapshot.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-text-secondary mt-1 flex items-center justify-between">
                      <span>{currentSnapshot.events.length} events</span>
                      <span className="text-accent-cyan">●</span>
                    </div>
                  </div>
                )}
                <ForceNetworkGraph3D selectedSector={selectedSector} showControls={false} snapshot={currentSnapshot} />
              </div>
            </div>
          )}

          {viewMode === 'globe' && (
            <div className="h-full relative">
              <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur border border-accent-cyan rounded px-2 py-1">
                <span className="text-xs font-semibold text-accent-cyan">
                  Globe 3D - {globeViewMode === 'companies' ? 'Companies' : globeViewMode === 'flows' ? 'Cash Flows' : 'M2 Liquidity'}
                </span>
              </div>
              {/* Date Legend - Top Right */}
              {currentSnapshot && (
                <div className="absolute top-4 right-4 z-10 bg-black/95 backdrop-blur-md border-2 border-accent-emerald/50 rounded-lg px-4 py-3 shadow-2xl shadow-emerald-500/20">
                  <div className="text-xs text-text-tertiary mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    SIMULATION TIME
                  </div>
                  <div className="text-2xl font-bold text-accent-emerald font-mono">
                    {currentSnapshot.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 flex items-center justify-between">
                    <span>{currentSnapshot.events.length} events</span>
                    <span className="text-accent-cyan">●</span>
                  </div>
                </div>
              )}
              <Globe3D selectedSector={selectedSector} showControls={false} viewMode={globeViewMode} snapshot={currentSnapshot} />
            </div>
          )}

          {viewMode === 'network' && (
            <div className="h-full relative">
              <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur border border-accent-magenta rounded px-2 py-1">
                <span className="text-xs font-semibold text-accent-magenta">Network Graph - Relationships</span>
              </div>
              {/* Date Legend - Top Right */}
              {currentSnapshot && (
                <div className="absolute top-4 right-4 z-10 bg-black/95 backdrop-blur-md border-2 border-accent-emerald/50 rounded-lg px-4 py-3 shadow-2xl shadow-emerald-500/20">
                  <div className="text-xs text-text-tertiary mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    SIMULATION TIME
                  </div>
                  <div className="text-2xl font-bold text-accent-emerald font-mono">
                    {currentSnapshot.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 flex items-center justify-between">
                    <span>{currentSnapshot.events.length} events</span>
                    <span className="text-accent-cyan">●</span>
                  </div>
                </div>
              )}
              <ForceNetworkGraph3D selectedSector={selectedSector} showControls={false} snapshot={currentSnapshot} />
            </div>
          )}

          {viewMode === 'supply-chain' && (
            <div className="h-full relative overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                {/* Supply Chain Theme Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-text-primary">Supply Chain Analysis</h2>
                    <div className="flex gap-2">
                      {[
                        { id: 'ai_boom', theme: AI_BOOM_THEME, icon: '🤖' },
                        { id: 'fed_rate', theme: FED_RATE_THEME, icon: '🏦' },
                        { id: 'trade_war', theme: TRADE_WAR_THEME, icon: '🌐' },
                        { id: 'm2', theme: M2_LIQUIDITY_THEME, icon: '💰' },
                      ].map(({ id, theme, icon }) => (
                        <button
                          key={id}
                          onClick={() => setSupplyChainTheme(id as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                            supplyChainTheme === id
                              ? 'bg-accent-cyan text-black border-accent-cyan shadow-lg shadow-accent-cyan/50'
                              : 'bg-background-secondary text-text-secondary border-border-primary hover:border-accent-cyan/50 hover:text-text-primary'
                          }`}
                        >
                          <span className="mr-2">{icon}</span>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {supplyChainTheme === 'ai_boom' && AI_BOOM_THEME.description}
                    {supplyChainTheme === 'fed_rate' && FED_RATE_THEME.description}
                    {supplyChainTheme === 'trade_war' && TRADE_WAR_THEME.description}
                    {supplyChainTheme === 'm2' && M2_LIQUIDITY_THEME.description}
                  </p>
                </div>

                <SupplyChainDiagram
                  nodes={
                    supplyChainTheme === 'ai_boom' ? AI_BOOM_THEME.nodes :
                    supplyChainTheme === 'fed_rate' ? FED_RATE_THEME.nodes :
                    supplyChainTheme === 'trade_war' ? TRADE_WAR_THEME.nodes :
                    M2_LIQUIDITY_THEME.nodes
                  }
                  links={
                    supplyChainTheme === 'ai_boom' ? AI_BOOM_THEME.connections :
                    supplyChainTheme === 'fed_rate' ? FED_RATE_THEME.connections :
                    supplyChainTheme === 'trade_war' ? TRADE_WAR_THEME.connections :
                    M2_LIQUIDITY_THEME.connections
                  }
                  title={
                    supplyChainTheme === 'ai_boom' ? AI_BOOM_THEME.name :
                    supplyChainTheme === 'fed_rate' ? FED_RATE_THEME.name :
                    supplyChainTheme === 'trade_war' ? TRADE_WAR_THEME.name :
                    M2_LIQUIDITY_THEME.name
                  }
                  description={
                    supplyChainTheme === 'ai_boom' ? AI_BOOM_THEME.description :
                    supplyChainTheme === 'fed_rate' ? FED_RATE_THEME.description :
                    supplyChainTheme === 'trade_war' ? TRADE_WAR_THEME.description :
                    M2_LIQUIDITY_THEME.description
                  }
                />

                {/* Timeline Simulation (Legacy) */}
                <div className="mt-6">
                  <SimulationTimeline />
                </div>

                {/* Additional Supply Chain Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card className="p-6 border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch size={18} className="text-red-400" />
                      <h3 className="text-base font-semibold text-text-primary">Critical Bottlenecks</h3>
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                        <div>
                          <span className="font-semibold text-white">ASML EUV:</span> Monopoly on extreme ultraviolet lithography equipment (18-24 month lead time)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                        <div>
                          <span className="font-semibold text-white">HBM3E Memory:</span> SK Hynix controls 95% of supply (4-6 month lead time)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                        <div>
                          <span className="font-semibold text-white">TSMC CoWoS:</span> Advanced packaging capacity constrained
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-green-500/30 bg-green-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={18} className="text-green-400" />
                      <h3 className="text-base font-semibold text-text-primary">Economics</h3>
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <div className="flex justify-between">
                        <span>H100 Price:</span>
                        <span className="font-mono text-green-400">$30,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HBM3E Cost:</span>
                        <span className="font-mono text-green-400">$1,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TSMC Wafer:</span>
                        <span className="font-mono text-green-400">$16,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Margin:</span>
                        <span className="font-mono text-green-400">~65%</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-cyan-500/30 bg-cyan-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Network size={18} className="text-cyan-400" />
                      <h3 className="text-base font-semibold text-text-primary">Dependencies</h3>
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <div>
                        <span className="font-semibold text-white">Geopolitical Risk:</span> Taiwan dependency for TSMC manufacturing
                      </div>
                      <div>
                        <span className="font-semibold text-white">Alternative Sources:</span> Samsung (limited), Intel (developing)
                      </div>
                      <div>
                        <span className="font-semibold text-white">Lead Time:</span> 12-18 months from order to delivery
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Element Library & Scenarios */}
        <div className="w-80 border-l border-border-primary bg-black/50 backdrop-blur overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Element Library */}
            <div>
              <button
                onClick={() => setShowElementLibrary(!showElementLibrary)}
                className="w-full flex items-center justify-between p-3 bg-background-secondary hover:bg-background-tertiary rounded-lg border border-border-primary transition-all"
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-accent-cyan" />
                  <span className="text-sm font-semibold">Element Library</span>
                </div>
                <span className="text-xs text-text-tertiary">{showElementLibrary ? '▼' : '▶'}</span>
              </button>

              {showElementLibrary && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-text-tertiary px-2">
                    Drag & drop elements to create custom relationships (Coming Soon)
                  </p>

                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-text-secondary px-2 py-1">Relationship Types</div>
                    <div className="space-y-1">
                      {['Impact', 'Ownership', 'Supply Chain', 'Loan', 'Competition'].map(type => (
                        <div
                          key={type}
                          className="px-3 py-2 bg-background-tertiary rounded border border-border-primary hover:border-accent-cyan transition-all cursor-move"
                        >
                          <span className="text-xs text-text-primary">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-text-secondary px-2 py-1">Macro Variables</div>
                    <div className="space-y-1">
                      {['Interest Rate', 'GDP Growth', 'M2 Supply', 'Oil Price'].map(type => (
                        <div
                          key={type}
                          className="px-3 py-2 bg-background-tertiary rounded border border-border-primary hover:border-accent-emerald transition-all cursor-move"
                        >
                          <span className="text-xs text-text-primary">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scenario Management */}
            <div>
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className="w-full flex items-center justify-between p-3 bg-background-secondary hover:bg-background-tertiary rounded-lg border border-border-primary transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-accent-magenta" />
                  <span className="text-sm font-semibold">Scenarios</span>
                </div>
                <span className="text-xs text-text-tertiary">{showScenarios ? '▼' : '▶'}</span>
              </button>

              {showScenarios && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-text-tertiary px-2">
                    Save, load, and share custom economic scenarios
                  </p>

                  <div className="space-y-1">
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="w-full px-3 py-2 bg-accent-cyan text-black text-xs font-semibold rounded-lg hover:bg-accent-cyan/80 transition-all"
                    >
                      <Save size={12} className="inline mr-1" />
                      Save Current Scenario
                    </button>
                    <button
                      onClick={() => setShowLoadDialog(true)}
                      className="w-full px-3 py-2 bg-background-tertiary text-text-primary text-xs font-semibold rounded-lg hover:bg-background-secondary transition-all border border-border-primary"
                    >
                      <Play size={12} className="inline mr-1" />
                      Load Scenario ({getAllScenarios().length})
                    </button>
                  </div>

                  {/* Save Dialog */}
                  {showSaveDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="bg-background-primary border-2 border-accent-cyan rounded-lg p-6 w-96 max-w-[90vw]">
                        <h3 className="text-lg font-bold text-text-primary mb-4">Save Scenario</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-text-secondary mb-1 block">Scenario Name *</label>
                            <input
                              type="text"
                              value={scenarioName}
                              onChange={(e) => setScenarioName(e.target.value)}
                              placeholder="e.g., My Custom Scenario"
                              className="w-full px-3 py-2 bg-background-secondary border border-border-primary rounded text-sm text-text-primary focus:outline-none focus:border-accent-cyan"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-text-secondary mb-1 block">Description (Optional)</label>
                            <textarea
                              value={scenarioDescription}
                              onChange={(e) => setScenarioDescription(e.target.value)}
                              placeholder="Describe your scenario..."
                              rows={3}
                              className="w-full px-3 py-2 bg-background-secondary border border-border-primary rounded text-sm text-text-primary focus:outline-none focus:border-accent-cyan resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveScenario}
                              className="flex-1 px-4 py-2 bg-accent-cyan text-black font-semibold rounded hover:bg-accent-cyan/80 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setShowSaveDialog(false);
                                setScenarioName('');
                                setScenarioDescription('');
                              }}
                              className="flex-1 px-4 py-2 bg-background-secondary text-text-primary border border-border-primary rounded hover:bg-background-tertiary transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Load Dialog */}
                  {showLoadDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="bg-background-primary border-2 border-accent-magenta rounded-lg p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-text-primary mb-4">Load Scenario</h3>
                        <div className="space-y-2">
                          {getAllScenarios().length === 0 ? (
                            <p className="text-sm text-text-tertiary text-center py-8">
                              No saved scenarios yet. Save your current state to create one!
                            </p>
                          ) : (
                            getAllScenarios().map((scenario) => (
                              <button
                                key={scenario.id}
                                onClick={() => handleLoadScenario(scenario.id)}
                                className="w-full px-4 py-3 bg-background-secondary border border-border-primary rounded-lg hover:border-accent-magenta hover:bg-background-tertiary transition-all text-left"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-base">{scenario.icon || '💾'}</span>
                                      <span className="text-sm font-semibold text-text-primary">{scenario.name}</span>
                                    </div>
                                    <p className="text-xs text-text-tertiary line-clamp-2">{scenario.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[10px] text-text-tertiary">
                                        {new Date(scenario.createdAt).toLocaleDateString()}
                                      </span>
                                      {scenario.tags && scenario.tags.length > 0 && (
                                        <div className="flex gap-1">
                                          {scenario.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Play size={16} className="text-accent-magenta mt-1" />
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <button
                          onClick={() => setShowLoadDialog(false)}
                          className="w-full mt-4 px-4 py-2 bg-background-secondary text-text-primary border border-border-primary rounded hover:bg-background-tertiary transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border-primary">
                    <div className="text-xs font-semibold text-text-secondary mb-2">Historical Scenarios</div>
                    <div className="space-y-2">
                      {SCENARIOS.map(scenario => (
                        <button
                          key={scenario.id}
                          onClick={() => applyScenario(scenario.id)}
                          className={`w-full px-3 py-2 text-left rounded-lg transition-all border ${
                            activeScenario === scenario.id
                              ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/20'
                              : 'bg-background-tertiary border-border-primary hover:border-accent-magenta hover:bg-background-secondary'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{scenario.icon}</span>
                            <span className="text-xs font-semibold">{scenario.name}</span>
                          </div>
                          <div className="text-[10px] text-text-tertiary">{scenario.description}</div>
                          {activeScenario === scenario.id && (
                            <div className="mt-2 pt-2 border-t border-accent-cyan/30">
                              <div className="text-[10px] text-accent-cyan flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                                Active
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Community Scenario Market */}
                  <div className="pt-3 border-t border-border-primary mt-3">
                    <div className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-2">
                      <Users size={14} className="text-accent-magenta" />
                      Community Scenarios (Poly Market Style)
                    </div>
                    <div className="bg-background-tertiary rounded-lg p-2 border border-border-primary">
                      <ScenarioMarket
                        onScenarioSelect={(scenario) => {
                          console.log('Community scenario selected:', scenario.name);
                          // Apply community scenario
                          setMacroChanging(true);
                          Object.entries(scenario.macroState).forEach(([key, value]) => {
                            updateMacroVariable(key, value);
                          });
                          setTimeout(() => {
                            setMacroChanging(false);
                          }, 1500);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Status */}
            <div className="bg-background-secondary border border-border-primary rounded-lg p-3">
              <h3 className="text-xs font-semibold text-text-primary mb-2">Current Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Selected Sector:</span>
                  <span className="text-accent-cyan font-semibold">
                    {selectedSector ? sectors.find(s => s.id === selectedSector)?.label : 'All Sectors'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Fed Rate:</span>
                  <span className="text-accent-emerald font-mono font-bold">
                    {(macroState['fed_funds_rate'] || 5.25).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">View Mode:</span>
                  <span className="text-text-primary capitalize">{viewMode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cascade Effects Animation */}
      <CascadeEffects />
    </div>
  );
}
