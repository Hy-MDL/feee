'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Settings, Globe, Network, Zap, Play, Save, Users, Sparkles, ChevronDown, ChevronUp, Info, GitBranch, ThumbsUp, ThumbsDown, Activity, DollarSign } from 'lucide-react';
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
import EconomicFlowDashboard from '@/components/simulation/EconomicFlowDashboard';
import HedgeFundSimulator from '@/components/simulation/HedgeFundSimulator';
import { DateSnapshot } from '@/lib/utils/dateBasedSimulation';
import { SUPPLY_CHAIN_SCENARIOS, voteOnScenario } from '@/data/supplyChainScenarios';
import { calculateEconomicFlows, EconomicFlow } from '@/lib/utils/economicFlows';

// Dynamic imports
const Globe3D = dynamic(() => import('@/components/visualization/Globe3D'), { ssr: false });
const ForceNetworkGraph3D = dynamic(() => import('@/components/visualization/ForceNetworkGraph3D'), { ssr: false });

type Sector = 'BANKING' | 'REALESTATE' | 'MANUFACTURING' | 'SEMICONDUCTOR' | null;
type Topic = 'supply-chain' | 'hedge-fund' | 'real-estate' | 'commodities' | 'crypto' | 'all'; // 🔍 Topic type

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
  // Zustand stores - must be called first
  const macroState = useMacroStore(state => state.macroState);
  const updateMacroVariable = useMacroStore(state => state.updateMacroVariable);
  const calculatedImpacts = useMacroStore(state => state.calculatedImpacts);

  const levelState = useLevelStore(state => state.levelState);
  const updateLevelControl = useLevelStore(state => state.updateLevelControl);

  const { saveScenario, loadScenario, getAllScenarios } = useScenarioStore();

  // Local state
  const [selectedSector, setSelectedSector] = useState<Sector>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic>('all'); // 🔍 Topic filter state
  const [viewMode, setViewMode] = useState<'split' | 'globe' | 'network' | 'supply-chain' | 'economic-flow' | 'hedge-fund'>('split');
  // globeViewMode removed - now using unified view that shows everything
  const [showElementLibrary, setShowElementLibrary] = useState(false);
  const [showScenarios, setShowScenarios] = useState(true); // Open by default
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [macroChanging, setMacroChanging] = useState(false);
  const [changedMacroId, setChangedMacroId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<DateSnapshot | null>(null);
  const [previousMacro, setPreviousMacro] = useState(macroState);
  const [simStartDate, setSimStartDate] = useState<string>('2024-01-01');
  const [simEndDate, setSimEndDate] = useState<string>('2024-12-31');
  const [selectedSCScenario, setSelectedSCScenario] = useState<string>('nvidia-h100-hbm');
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

  // Track previous macro state for flow calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousMacro(macroState);
    }, 100);
    return () => clearTimeout(timer);
  }, [macroState]);

  // Calculate economic flows for Globe visualization
  const currentEconomicFlows = useMemo(() => {
    return calculateEconomicFlows(macroState, previousMacro, levelState);
  }, [macroState, previousMacro, levelState]);

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

    // Set simulation date range based on scenario
    // Start from scenario date and simulate for 12 months
    const scenarioDate = new Date(scenario.date);
    const endDate = new Date(scenarioDate);
    endDate.setMonth(endDate.getMonth() + 12);

    setSimStartDate(scenario.date);
    setSimEndDate(endDate.toISOString().split('T')[0]);

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

  // 🔍 Topic filters for interactive supply chain/industry visualization
  const topics = [
    { id: 'all' as Topic, label: 'All Topics', icon: '🌍', description: 'Show all companies and relationships' },
    { id: 'supply-chain' as Topic, label: 'Supply Chain', icon: '🔗', description: 'Manufacturing & semiconductor networks' },
    { id: 'hedge-fund' as Topic, label: 'Hedge Funds', icon: '💰', description: 'Banking & financial institutions' },
    { id: 'real-estate' as Topic, label: 'Real Estate', icon: '🏢', description: 'REITs & property markets' },
    { id: 'commodities' as Topic, label: 'Commodities', icon: '⛏️', description: 'Mining, oil, gas & raw materials' },
    { id: 'crypto' as Topic, label: 'Cryptocurrency', icon: '₿', description: 'Digital assets & blockchain' },
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
        {/* Left Sidebar - Enhanced Controls */}
        <div className="w-72 border-r border-border-primary bg-black/50 backdrop-blur p-4 overflow-y-auto">
          {/* 🔍 Topic Filter Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} className="text-accent-magenta" />
              <h3 className="text-base font-semibold text-text-primary">🔍 Topic Filter</h3>
            </div>
            <p className="text-sm text-text-tertiary mb-4">
              Focus on specific industries and supply chains
            </p>

            <div className="grid grid-cols-2 gap-2">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`px-3 py-2 rounded-lg text-left transition-all border ${
                    selectedTopic === topic.id
                      ? 'border-accent-magenta bg-accent-magenta/20 shadow-lg shadow-accent-magenta/20'
                      : 'border-border-primary bg-background-secondary hover:border-accent-magenta/50 hover:bg-background-tertiary'
                  }`}
                  title={topic.description}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-lg">{topic.icon}</span>
                    <span className="text-xs font-medium text-text-primary">{topic.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sector Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} className="text-accent-cyan" />
              <h3 className="text-base font-semibold text-text-primary">Sector Filter</h3>
            </div>
            <p className="text-sm text-text-tertiary mb-4">
              Select a sector to see macro impact on specific industries
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedSector(null)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  selectedSector === null
                    ? 'bg-accent-cyan text-black font-semibold shadow-lg shadow-accent-cyan/50'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌍</span>
                  <div>
                    <div className="text-sm font-medium">All Sectors</div>
                    <div className="text-xs opacity-70">Complete macro view</div>
                  </div>
                </div>
              </button>

              {sectors.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id as Sector)}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all border ${
                    selectedSector === sector.id
                      ? 'border-accent-cyan bg-accent-cyan/10 shadow-lg shadow-accent-cyan/20'
                      : 'border-border-primary bg-background-secondary hover:border-accent-cyan/50'
                  }`}
                  style={{
                    borderColor: selectedSector === sector.id ? sector.color : undefined
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sector.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{sector.label}</div>
                        <div className="text-xs text-text-tertiary">Topic-focused view</div>
                      </div>
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

          {/* Macro Controller - Enhanced */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-accent-magenta" />
              <h3 className="text-base font-semibold text-text-primary">Macro Variables</h3>
            </div>
            <p className="text-sm text-text-tertiary mb-4">
              Adjust to see real-time impact on globe entities
            </p>

            <div className="space-y-5">
              {macroControls.map(control => (
                <div key={control.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-text-secondary">{control.label}</label>
                    <span className={`text-sm font-mono font-bold px-3 py-1 rounded ${
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
                    className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent-cyan"
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

          {/* Legend - Unified Globe View */}
          <div className="mb-6">
            <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-accent-cyan" />
                <div className="text-xs text-text-tertiary font-semibold">Unified Globe Legend</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-emerald shadow-lg" style={{ boxShadow: '0 0 10px #00FF9F' }} />
                  <span className="text-xs text-text-primary">Companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-cyan shadow-lg" style={{ boxShadow: '0 0 10px #00E5FF' }} />
                  <span className="text-xs text-text-primary">Countries (M2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-accent-emerald to-transparent shadow-lg" style={{ boxShadow: '0 0 8px #00FF9F' }} />
                  <span className="text-xs text-accent-emerald font-semibold">⚡ Macro Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-accent-magenta to-transparent shadow-lg" style={{ boxShadow: '0 0 8px #E6007A' }} />
                  <span className="text-xs text-accent-magenta font-semibold">💰 Economic Flow</span>
                </div>
                <div className="text-xs text-text-tertiary mt-2">
                  Arc thickness reflects flow intensity (self-attention style)
                </div>
              </div>
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
              <DateSimulator
                onSnapshotChange={setCurrentSnapshot}
                initialStartDate={simStartDate}
                initialEndDate={simEndDate}
              />
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
            <h3 className="text-sm font-semibold text-text-tertiary mb-3">View Mode</h3>
            <div className="space-y-2">
              <button
                onClick={() => setViewMode('split')}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-accent-cyan text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>Unified Globe View</span>
                </div>
                <div className="text-xs opacity-70 mt-1">Companies + Flows + Impacts</div>
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'network'
                    ? 'bg-accent-magenta text-black'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Network size={16} />
                  <span>Network Graph</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('supply-chain')}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'supply-chain'
                    ? 'bg-purple-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={16} />
                  <span>Supply Chain</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('economic-flow')}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'economic-flow'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  <span>Economic Flows</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('hedge-fund')}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'hedge-fund'
                    ? 'bg-pink-500 text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span>Hedge Fund</span>
                </div>
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
                    Globe 3D - Unified View (Companies + Countries + All Flows)
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
                <Globe3D selectedSector={selectedSector} selectedTopic={selectedTopic} showControls={false} snapshot={currentSnapshot} economicFlows={currentEconomicFlows} />
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
                  Globe 3D - Unified View (Companies + Countries + All Flows)
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
              <Globe3D selectedSector={selectedSector} selectedTopic={selectedTopic} showControls={false} snapshot={currentSnapshot} economicFlows={currentEconomicFlows} />
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

          {viewMode === 'economic-flow' && (
            <div className="h-full relative overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <EconomicFlowDashboard
                  currentMacro={macroState}
                  previousMacro={previousMacro}
                  levelState={levelState}
                />
              </div>
            </div>
          )}

          {viewMode === 'hedge-fund' && (
            <div className="h-full relative overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <HedgeFundSimulator initialCapital={100_000_000} />
              </div>
            </div>
          )}

          {viewMode === 'supply-chain' && (
            <div className="h-full relative overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                {/* Supply Chain Marketplace */}
                <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Supply Chain Marketplace</h2>
                      <p className="text-sm text-text-secondary">Community-driven supply chain analysis - Vote on scenarios</p>
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {SUPPLY_CHAIN_SCENARIOS.length} scenarios
                    </div>
                  </div>

                  {/* Scenario Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUPPLY_CHAIN_SCENARIOS.map((scenario) => {
                      const approvalRate = scenario.upvotes + scenario.downvotes > 0
                        ? (scenario.upvotes / (scenario.upvotes + scenario.downvotes)) * 100
                        : 0;
                      const isSelected = selectedSCScenario === scenario.id;

                      return (
                        <div
                          key={scenario.id}
                          onClick={() => setSelectedSCScenario(scenario.id)}
                          className={`bg-background-secondary border rounded-lg p-4 cursor-pointer transition-all hover:border-accent-cyan/50 ${
                            isSelected ? 'border-accent-cyan ring-2 ring-accent-cyan/20' : 'border-border-primary'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{scenario.icon}</span>
                              <div>
                                <h3 className="text-sm font-semibold text-text-primary">{scenario.name}</h3>
                                <p className="text-xs text-text-tertiary mt-0.5">{scenario.createdBy}</p>
                              </div>
                            </div>

                            {/* Voting */}
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  voteOnScenario(scenario.id, true);
                                }}
                                className="text-text-tertiary hover:text-accent-emerald transition-colors"
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <span className={`text-xs font-bold ${
                                scenario.votes > 0 ? 'text-accent-emerald' : scenario.votes < 0 ? 'text-red-400' : 'text-text-tertiary'
                              }`}>
                                {scenario.votes > 0 ? `+${scenario.votes}` : scenario.votes}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  voteOnScenario(scenario.id, false);
                                }}
                                className="text-text-tertiary hover:text-red-400 transition-colors"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-text-secondary mb-3 line-clamp-2">{scenario.description}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {scenario.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${
                              scenario.criticality === 'critical' ? 'text-red-400' :
                              scenario.criticality === 'high' ? 'text-orange-400' :
                              scenario.criticality === 'medium' ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {scenario.criticality.toUpperCase()} RISK
                            </span>
                            {approvalRate >= 70 && (
                              <span className="text-accent-emerald font-semibold">
                                {approvalRate.toFixed(0)}% approval
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Supply Chain Diagram */}
                {(() => {
                  const selected = SUPPLY_CHAIN_SCENARIOS.find(s => s.id === selectedSCScenario);
                  return selected ? (
                    <SupplyChainDiagram
                      nodes={selected.nodes}
                      links={selected.links}
                      title={selected.name}
                      description={selected.description}
                    />
                  ) : null;
                })()}

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

        {/* Right Sidebar - BLOOMBERG TERMINAL STYLE */}
        <div className="w-80 border-l border-accent-emerald/30 bg-black overflow-y-auto font-mono">
          <div className="p-4 space-y-4">
            {/* SIMULATION TIME - Bloomberg Style */}
            <div className="border-2 border-accent-emerald/50 bg-black p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                <span className="text-xs text-accent-emerald/70 font-bold tracking-wider">SIMULATION TIME</span>
              </div>
              {currentSnapshot ? (
                <div>
                  <div className="text-4xl font-bold text-accent-emerald font-mono leading-none">
                    {currentSnapshot.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-2xl font-bold text-accent-emerald/80 font-mono">
                    {currentSnapshot.date.getFullYear()}
                  </div>
                  <div className="text-xs text-accent-cyan mt-2">
                    {currentSnapshot.events.length} events
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl font-bold text-accent-emerald font-mono leading-none">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-2xl font-bold text-accent-emerald/80 font-mono">
                    {new Date().getFullYear()}
                  </div>
                  <div className="text-xs text-text-tertiary mt-2">Real-time</div>
                </div>
              )}
            </div>

            {/* RECENT EVENTS - Show simulation events */}
            <div className="border border-accent-cyan/30 bg-black/80 rounded-lg overflow-hidden">
              <div className="bg-accent-cyan/10 px-3 py-2 border-b border-accent-cyan/30">
                <span className="text-xs text-accent-cyan font-bold tracking-wider">
                  RECENT EVENTS ({currentSnapshot?.events.length || 0})
                </span>
              </div>
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {currentSnapshot && currentSnapshot.events.length > 0 ? (
                  currentSnapshot.events.map((event, idx) => {
                    const impactColor = event.impact === 'positive' ? 'text-accent-emerald' :
                                       event.impact === 'negative' ? 'text-red-400' : 'text-text-tertiary';
                    const impactSign = event.impact === 'positive' ? '+' : event.impact === 'negative' ? '-' : '';

                    return (
                      <div key={idx} className="p-2 border border-border-primary/30 rounded bg-black/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-text-primary mb-0.5">
                              {event.title}
                            </div>
                            {event.magnitude && (
                              <div className={`text-xs font-mono font-bold ${impactColor}`}>
                                {impactSign}{(event.magnitude * 100).toFixed(1)}% change
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-text-tertiary text-center py-4">
                    No active events. Play simulation to see events.
                  </div>
                )}
              </div>
            </div>

            {/* TOP PERFORMERS - Show entities with biggest changes */}
            <div className="border border-accent-emerald/30 bg-black/80 rounded-lg overflow-hidden">
              <div className="bg-accent-emerald/10 px-3 py-2 border-b border-accent-emerald/30">
                <span className="text-xs text-accent-emerald font-bold tracking-wider">TOP PERFORMERS</span>
              </div>
              <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                {currentSnapshot && currentSnapshot.entityValues.size > 0 ? (
                  Array.from(currentSnapshot.entityValues.entries())
                    .filter(([_, entity]) => entity.changePercent && Math.abs(entity.changePercent) > 0.01)
                    .sort((a, b) => Math.abs(b[1].changePercent || 0) - Math.abs(a[1].changePercent || 0))
                    .slice(0, 5)
                    .map(([entityId, entity], idx) => {
                      const isPositive = (entity.changePercent || 0) >= 0;
                      const changeColor = isPositive ? 'text-accent-emerald' : 'text-red-400';

                      // Extract entity name from ID
                      const entityName = entity.name || entityId.replace(/^(company|component|product)-/, '').replace(/-/g, ' ').toUpperCase();
                      const entityType = entityId.startsWith('company-') ? 'COMPANY' :
                                        entityId.startsWith('component-') ? 'COMPONENT' : 'PRODUCT';

                      return (
                        <div key={entityId} className="p-2 border border-accent-emerald/20 rounded bg-black/40">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-text-primary truncate">
                                {entityName}
                              </div>
                              <div className="text-[9px] text-text-tertiary">
                                {entityType}
                              </div>
                            </div>
                            <div className={`text-xs font-mono font-bold ${changeColor} flex-shrink-0`}>
                              {isPositive ? '+' : ''}{((entity.changePercent || 0) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-[10px] text-text-tertiary text-center py-4">
                    No data. Play simulation to see top performers.
                  </div>
                )}
              </div>
            </div>

            {/* CURRENT STATUS - Terminal Style */}
            <div className="border border-accent-magenta/30 bg-black/80 rounded-lg overflow-hidden">
              <div className="bg-accent-magenta/10 px-3 py-2 border-b border-accent-magenta/30">
                <span className="text-xs text-accent-magenta font-bold tracking-wider">CURRENT STATUS</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border-primary/30">
                  <span className="text-text-tertiary">SECTOR</span>
                  <span className="text-accent-cyan font-semibold">
                    {selectedSector ? sectors.find(s => s.id === selectedSector)?.label : 'ALL'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-primary/30">
                  <span className="text-text-tertiary">FED RATE</span>
                  <span className="text-accent-emerald font-mono font-bold">
                    {(macroState['fed_funds_rate'] || 5.25).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-primary/30">
                  <span className="text-text-tertiary">VIEW</span>
                  <span className="text-text-primary capitalize">{viewMode}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-tertiary">SCENARIO</span>
                  <span className={activeScenario ? "text-accent-emerald font-semibold" : "text-text-tertiary"}>
                    {activeScenario ? SCENARIOS.find(s => s.id === activeScenario)?.name.substring(0, 15) : 'BASELINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* SAVE/LOAD SCENARIOS - Compact Terminal Style */}
            <div className="border border-accent-cyan/20 bg-black/60 rounded-lg overflow-hidden p-3">
              <div className="text-[10px] text-accent-cyan/70 mb-2 tracking-wider">SCENARIO MGMT</div>
              <div className="space-y-1.5">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full px-2 py-1.5 bg-accent-cyan/20 text-accent-cyan text-[10px] font-bold rounded border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-all tracking-wider"
                >
                  💾 SAVE
                </button>
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="w-full px-2 py-1.5 bg-accent-magenta/20 text-accent-magenta text-[10px] font-bold rounded border border-accent-magenta/50 hover:bg-accent-magenta/30 transition-all tracking-wider"
                >
                  📂 LOAD ({getAllScenarios().length})
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Save Dialog - Terminal Style */}
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

        {/* Load Dialog - Terminal Style */}
        {showLoadDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-black border-2 border-accent-magenta rounded-lg p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto font-mono">
              <h3 className="text-lg font-bold text-accent-magenta mb-4 tracking-wider">LOAD SCENARIO</h3>
              <div className="space-y-2">
                {getAllScenarios().length === 0 ? (
                  <p className="text-sm text-text-tertiary text-center py-8">
                    NO SAVED SCENARIOS
                  </p>
                ) : (
                  getAllScenarios().map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => handleLoadScenario(scenario.id)}
                      className="w-full px-4 py-3 bg-black border border-accent-magenta/50 rounded-lg hover:border-accent-magenta hover:bg-accent-magenta/10 transition-all text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-accent-magenta">
                              {scenario.name}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {new Date(scenario.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {scenario.description && (
                            <p className="text-xs text-text-secondary">{scenario.description}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setShowLoadDialog(false)}
                className="w-full mt-4 px-4 py-2 bg-black text-text-primary border border-accent-magenta/50 rounded hover:bg-accent-magenta/10 transition-all tracking-wider"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cascade Effects Animation */}
      <CascadeEffects />
    </div>
  );
}
