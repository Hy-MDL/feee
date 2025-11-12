'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMacroStore } from '@/lib/store/macroStore';
import { useLevelStore } from '@/lib/store/levelStore';
import { companies, Company } from '@/data/companies';
import { getSectorColor } from '@/lib/config/sectors.config';
import { MACRO_VARIABLES } from '@/data/macroVariables';
import { TRADE_FLOWS, SHIPPING_ROUTES, SUPPLY_CHAIN_PATHS, CURRENCY_FLOWS } from '@/data/globalSupplyChain';
import { getImpactColor, getImpactSizeMultiplier } from '@/lib/utils/levelImpactCalculation';
import { DateSnapshot } from '@/lib/utils/dateBasedSimulation';
import { EconomicFlow } from '@/lib/utils/economicFlows';

// Dynamic import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// 🔑 Arc ID Generator: Create stable IDs to prevent "popping" on re-render
const generateArcId = (startLat: number, startLng: number, endLat: number, endLng: number, type: string = 'arc'): string => {
  return `${type}-${startLat.toFixed(4)}-${startLng.toFixed(4)}-${endLat.toFixed(4)}-${endLng.toFixed(4)}`;
};

interface Country {
  lat: number;
  lng: number;
  name: string;
  code: string;
  m2Supply: number; // in trillions USD
  gdp: number;
  color: string;
  size: number;
}

interface CapitalFlow {
  id: string; // 🔑 CRITICAL: Unique ID for arc persistence (prevents "popping")
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  amount: number; // in billions USD
  color: string;
  label: string;
  type?: 'static' | 'dynamic' | 'economic' | 'snapshot'; // Arc type for filtering
}

// Major economies with M2 money supply data
const COUNTRIES: Country[] = [
  { lat: 37.5665, lng: 126.9780, name: 'South Korea', code: 'KR', m2Supply: 3.2, gdp: 1.7, color: '#00E5FF', size: 0.8 },
  { lat: 37.7749, lng: -122.4194, name: 'United States', code: 'US', m2Supply: 21.4, gdp: 25.5, color: '#FFD700', size: 1.5 },
  { lat: 35.6762, lng: 139.6503, name: 'Japan', code: 'JP', m2Supply: 11.2, gdp: 4.2, color: '#FF6B6B', size: 1.2 },
  { lat: 39.9042, lng: 116.4074, name: 'China', code: 'CN', m2Supply: 38.6, gdp: 17.9, color: '#EF4444', size: 2.0 },
  { lat: 51.5074, lng: -0.1278, name: 'United Kingdom', code: 'GB', m2Supply: 3.5, gdp: 3.1, color: '#8B5CF6', size: 0.9 },
  { lat: 52.5200, lng: 13.4050, name: 'Germany', code: 'DE', m2Supply: 4.2, gdp: 4.3, color: '#06B6D4', size: 1.0 },
  { lat: 48.8566, lng: 2.3522, name: 'France', code: 'FR', m2Supply: 3.8, gdp: 2.9, color: '#00FF9F', size: 0.9 },
  { lat: -23.5505, lng: -46.6333, name: 'Brazil', code: 'BR', m2Supply: 1.9, gdp: 2.1, color: '#F59E0B', size: 0.7 },
  { lat: 28.6139, lng: 77.2090, name: 'India', code: 'IN', m2Supply: 2.8, gdp: 3.7, color: '#E6007A', size: 1.1 },
  { lat: 25.2048, lng: 55.2708, name: 'UAE', code: 'AE', m2Supply: 0.5, gdp: 0.5, color: '#39FF14', size: 0.5 },
];

// 🔥 STATIC FLOWS with Stable IDs (prevents "popping")
// These arcs persist across re-renders because IDs are deterministic
const COMPREHENSIVE_FLOWS: CapitalFlow[] = [
  // Original capital flows
  { id: generateArcId(37.7749, -122.4194, 39.9042, 116.4074, 'capital'), type: 'static', startLat: 37.7749, startLng: -122.4194, endLat: 39.9042, endLng: 116.4074, amount: 150, color: 'rgba(255, 215, 0, 0.6)', label: 'US → China Capital' },
  { id: generateArcId(37.7749, -122.4194, 35.6762, 139.6503, 'capital'), type: 'static', startLat: 37.7749, startLng: -122.4194, endLat: 35.6762, endLng: 139.6503, amount: 120, color: 'rgba(255, 215, 0, 0.6)', label: 'US → Japan Capital' },
  { id: generateArcId(37.7749, -122.4194, 51.5074, -0.1278, 'capital'), type: 'static', startLat: 37.7749, startLng: -122.4194, endLat: 51.5074, endLng: -0.1278, amount: 100, color: 'rgba(255, 215, 0, 0.6)', label: 'US → UK Capital' },
  { id: generateArcId(37.7749, -122.4194, 37.5665, 126.9780, 'capital'), type: 'static', startLat: 37.7749, startLng: -122.4194, endLat: 37.5665, endLng: 126.9780, amount: 80, color: 'rgba(255, 215, 0, 0.6)', label: 'US → Korea Capital' },
  { id: generateArcId(39.9042, 116.4074, 37.5665, 126.9780, 'capital'), type: 'static', startLat: 39.9042, startLng: 116.4074, endLat: 37.5665, endLng: 126.9780, amount: 90, color: 'rgba(239, 68, 68, 0.6)', label: 'China → Korea Capital' },
  { id: generateArcId(39.9042, 116.4074, 28.6139, 77.2090, 'capital'), type: 'static', startLat: 39.9042, startLng: 116.4074, endLat: 28.6139, endLng: 77.2090, amount: 70, color: 'rgba(239, 68, 68, 0.6)', label: 'China → India Capital' },
  { id: generateArcId(39.9042, 116.4074, 25.2048, 55.2708, 'capital'), type: 'static', startLat: 39.9042, startLng: 116.4074, endLat: 25.2048, endLng: 55.2708, amount: 50, color: 'rgba(239, 68, 68, 0.6)', label: 'China → UAE Capital' },
  { id: generateArcId(52.5200, 13.4050, 48.8566, 2.3522, 'capital'), type: 'static', startLat: 52.5200, startLng: 13.4050, endLat: 48.8566, endLng: 2.3522, amount: 60, color: 'rgba(0, 229, 255, 0.6)', label: 'Germany → France Capital' },
  { id: generateArcId(51.5074, -0.1278, 52.5200, 13.4050, 'capital'), type: 'static', startLat: 51.5074, startLng: -0.1278, endLat: 52.5200, endLng: 13.4050, amount: 55, color: 'rgba(139, 92, 246, 0.6)', label: 'UK → Germany Capital' },
  { id: generateArcId(35.6762, 139.6503, 37.7749, -122.4194, 'capital'), type: 'static', startLat: 35.6762, startLng: 139.6503, endLat: 37.7749, endLng: -122.4194, amount: 100, color: 'rgba(255, 107, 107, 0.6)', label: 'Japan → US Capital' },
  { id: generateArcId(37.5665, 126.9780, 39.9042, 116.4074, 'capital'), type: 'static', startLat: 37.5665, startLng: 126.9780, endLat: 39.9042, endLng: 116.4074, amount: 65, color: 'rgba(0, 229, 255, 0.6)', label: 'Korea → China Capital' },

  // Add Trade Flows (from globalSupplyChain.ts)
  ...TRADE_FLOWS.map(flow => ({
    id: generateArcId(flow.startLat, flow.startLng, flow.endLat, flow.endLng, 'trade'),
    type: 'static' as const,
    startLat: flow.startLat,
    startLng: flow.startLng,
    endLat: flow.endLat,
    endLng: flow.endLng,
    amount: flow.volume,
    color: flow.color.includes('rgba') ? flow.color : `${flow.color}99`, // Add alpha if not present
    label: `Trade: ${flow.product} ($${flow.volume}B)`
  })),

  // Add Shipping Routes
  ...SHIPPING_ROUTES.map(route => ({
    id: generateArcId(route.startLat, route.startLng, route.endLat, route.endLng, 'shipping'),
    type: 'static' as const,
    startLat: route.startLat,
    startLng: route.startLng,
    endLat: route.endLat,
    endLng: route.endLng,
    amount: route.frequency / 10, // Convert frequency to comparable amount
    color: route.mode === 'air' ? 'rgba(255, 215, 0, 0.5)' : route.color.includes('rgba') ? route.color : `${route.color}99`,
    label: `${route.mode === 'air' ? '✈️' : '🚢'} ${route.cargo} (${route.frequency}/mo)`
  })),

  // Add Supply Chain Paths (convert multi-node paths to individual arcs)
  ...SUPPLY_CHAIN_PATHS.flatMap(path =>
    path.nodes.slice(0, -1).map((node, i) => ({
      id: generateArcId(node.lat, node.lng, path.nodes[i + 1].lat, path.nodes[i + 1].lng, 'supply-chain'),
      type: 'static' as const,
      startLat: node.lat,
      startLng: node.lng,
      endLat: path.nodes[i + 1].lat,
      endLng: path.nodes[i + 1].lng,
      amount: 50, // Default amount for supply chain
      color: path.color.includes('rgba') ? path.color : `${path.color}CC`,
      label: `${path.product}: ${node.name} → ${path.nodes[i + 1].name}`
    }))
  ),

  // Add Currency Flows
  ...CURRENCY_FLOWS.map(flow => ({
    id: generateArcId(flow.startLat, flow.startLng, flow.endLat, flow.endLng, 'currency'),
    type: 'static' as const,
    startLat: flow.startLat,
    startLng: flow.startLng,
    endLat: flow.endLat,
    endLng: flow.endLng,
    amount: flow.volume / 10, // Scale down for visualization
    color: flow.color,
    label: `Forex: ${flow.pair} ($${flow.volume}B/day)`
  }))
];

// Backward compatibility
const CAPITAL_FLOWS = COMPREHENSIVE_FLOWS;

interface Globe3DProps {
  selectedSector?: string | null;
  selectedTopic?: 'supply-chain' | 'hedge-fund' | 'real-estate' | 'commodities' | 'crypto' | 'all' | null; // 🔍 Topic-based filtering
  showControls?: boolean;
  viewMode?: 'm2' | 'flows' | 'companies';
  snapshot?: DateSnapshot | null;
  economicFlows?: EconomicFlow[];
}

export default function Globe3D({
  selectedSector = null,
  selectedTopic = null, // 🔍 Topic filter
  showControls = true,
  viewMode: externalViewMode,
  snapshot = null,
  economicFlows = []
}: Globe3DProps) {
  const globeRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [internalViewMode, setInternalViewMode] = useState<'m2' | 'flows' | 'companies'>('companies');
  const viewMode = externalViewMode || internalViewMode;
  const [autoRotate, setAutoRotate] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const macroState = useMacroStore(state => state.macroState);
  const calculatedImpacts = useMacroStore(state => state.calculatedImpacts);
  const entityImpacts = useLevelStore(state => state.entityImpacts);
  const getEntityImpact = useLevelStore(state => state.getEntityImpact);

  // Measure container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Sector-to-country mapping (which countries are important for each sector)
  const sectorCountries: Record<string, string[]> = {
    SEMICONDUCTOR: ['KR', 'US', 'JP', 'CN'], // Korea, US, Japan, China
    BANKING: ['US', 'GB', 'DE', 'JP', 'CN'], // Major financial centers
    MANUFACTURING: ['CN', 'DE', 'JP', 'KR', 'US'], // Manufacturing powerhouses
    REALESTATE: ['US', 'CN', 'GB', 'FR', 'BR'] // Major real estate markets
  };

  // Auto-rotate globe
  useEffect(() => {
    if (autoRotate && globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }
    }
  }, [autoRotate]);

  // Adjust M2 based on global liquidity macro variable
  const adjustedCountries = useMemo(() => {
    const globalLiquidityMultiplier = 1 + ((macroState.global_m2_growth || 0) - 5) / 100;
    return COUNTRIES.map(country => ({
      ...country,
      id: `country-${country.code}`, // 🔑 CRITICAL: Stable ID prevents country point re-rendering
      m2Supply: country.m2Supply * globalLiquidityMultiplier,
      size: Math.log(country.m2Supply * globalLiquidityMultiplier) * 0.3
    }));
  }, [macroState.global_m2_growth]);

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    setAutoRotate(false);

    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: country.lat, lng: country.lng, altitude: 1.5 },
        1000
      );
    }
  };

  const handleGlobeClick = () => {
    setSelectedCountry(null);
  };

  // Filter countries based on selected sector
  const visibleCountries = useMemo(() => {
    if (!selectedSector) return adjustedCountries;
    const relevantCodes = sectorCountries[selectedSector] || [];
    return adjustedCountries.map(country => ({
      ...country,
      // Dim countries not relevant to selected sector
      color: relevantCodes.includes(country.code) ? country.color : 'rgba(100, 100, 100, 0.3)',
      size: relevantCodes.includes(country.code) ? country.size : country.size * 0.5
    }));
  }, [adjustedCountries, selectedSector]);

  // Calculate macro impact intensity (how much each variable changed from default)
  const macroImpacts = useMemo(() => {
    const impacts: Record<string, number> = {};

    MACRO_VARIABLES.forEach(variable => {
      const currentValue = macroState[variable.id] || variable.defaultValue;
      const defaultValue = variable.defaultValue;
      const range = variable.max - variable.min;

      // Normalized change: -1 to +1
      const change = (currentValue - defaultValue) / range;
      impacts[variable.id] = Math.abs(change);
    });

    return impacts;
  }, [macroState]);

  // 🔧 OPTIMIZED: Create stable point objects (prevent re-rendering/"popping")
  // Only regenerate when companies or filters change, NOT when impacts change
  const companyPointsBase = useMemo(() => {
    return companies
      .filter(c => c.location) // Only companies with location data
      .map(company => {
        const companyEntityId = `company-${company.ticker?.toLowerCase() || company.name.toLowerCase().replace(/\s+/g, '-')}`;

        return {
          id: companyEntityId, // 🔑 CRITICAL: Stable ID prevents point re-rendering
          lat: company.location!.lat,
          lng: company.location!.lng,
          name: company.name_en || company.name,
          ticker: company.ticker,
          sector: company.sector,
          company: company, // Store full company data for dynamic calculations
        };
      });
  }, [selectedSector, selectedTopic]); // 🔧 ONLY depend on filters, NOT impacts

  // Separate memoized calculation for visual properties
  const companyPoints = useMemo(() => {
    return companyPointsBase.map(point => {
      const company = point.company;

      const sectorImpact =
        company.sector === 'BANKING' ? calculatedImpacts.banking :
        company.sector === 'REALESTATE' ? calculatedImpacts.realEstate :
        company.sector === 'MANUFACTURING' ? calculatedImpacts.manufacturing :
        company.sector === 'SEMICONDUCTOR' ? calculatedImpacts.semiconductor :
        company.sector === 'CRYPTO' ? calculatedImpacts.crypto :
        0;

      // 🔍 Check sector relevance
      const isSectorRelevant = !selectedSector || company.sector === selectedSector;

      // 🔍 Check topic relevance
      const isTopicRelevant = !selectedTopic || selectedTopic === 'all' ||
        (company.topics && company.topics.includes(selectedTopic));

      // 🔍 Overall relevance: must match both filters (if active)
      const isRelevant = isSectorRelevant && isTopicRelevant;

      // Get level-specific impact for this company
      const levelImpact = getEntityImpact(point.id);

      // Combine macro sector impact with level-specific impact
      const totalImpact = sectorImpact + (levelImpact?.impactPercentage || 0);

      // Adjust size based on level impact (if any)
      const baseSize = Math.log(company.financials.revenue + 1) * 0.3;
      const adjustedSize = levelImpact
        ? baseSize * getImpactSizeMultiplier(levelImpact.impactScore)
        : baseSize;

      // 🔍 Use impact color if level impact exists, otherwise:
      // - Full color for relevant companies
      // - Dimmed gray for filtered-out companies
      let pointColor = levelImpact && Math.abs(levelImpact.impactScore) > 0.05
        ? getImpactColor(levelImpact.impactScore)
        : isRelevant ? getSectorColor(company.sector) : 'rgba(100, 100, 100, 0.2)';

      let finalSize = adjustedSize;

      // Check if entity is affected by recent events
      let isAffected = false;
      let affectedByEvent: any = null;

      // Override with snapshot data if available
      if (snapshot) {
        const snapshotEntity = snapshot.entityValues.get(point.id);
        if (snapshotEntity) {
          finalSize = snapshotEntity.size * baseSize; // Use snapshot size
          pointColor = snapshotEntity.color; // Use snapshot color
        }

        // Check if this entity is in any recent events
        snapshot.events.forEach(event => {
          if (event.affectedEntities.includes(point.id)) {
            isAffected = true;
            affectedByEvent = event;
          }
        });
      }

      return {
        ...point, // 🔧 Spread stable base properties
        size: finalSize,
        color: pointColor,
        impact: totalImpact,
        levelImpact: levelImpact,
        isAffected,
        affectedByEvent,
      };
    });
  }, [companyPointsBase, selectedSector, selectedTopic, calculatedImpacts, entityImpacts, getEntityImpact, snapshot]);

  // Helper to get RGB values from sector color (must come before dynamicImpactArcs)
  const getSectorRGB = (sector: string): string => {
    const colorMap: Record<string, string> = {
      BANKING: '0, 229, 255',        // cyan
      SEMICONDUCTOR: '192, 38, 211', // magenta
      MANUFACTURING: '0, 255, 159',  // emerald
      COMMODITIES: '245, 158, 11',   // orange
      REALESTATE: '16, 185, 129',    // green
      CRYPTO: '139, 92, 246',        // purple
      OPTIONS: '230, 0, 122',        // pink
    };
    return colorMap[sector] || '255, 255, 255';
  };

  // Generate dynamic impact arcs from snapshot events (time-based simulation)
  const snapshotImpactArcs = useMemo(() => {
    if (!snapshot || !snapshot.events || snapshot.events.length === 0) return [];

    const arcs: CapitalFlow[] = [];
    const companyLocationMap = new Map<string, { lat: number; lng: number }>();

    // Build location map for all companies
    companies.forEach(company => {
      if (company.location) {
        const entityId = `company-${company.ticker?.toLowerCase() || company.name.toLowerCase().replace(/\s+/g, '-')}`;
        companyLocationMap.set(entityId, company.location);
      }
    });

    // Create arcs from snapshot events
    snapshot.events.forEach(event => {
      event.affectedEntities.forEach(targetEntityId => {
        const targetLocation = companyLocationMap.get(targetEntityId);

        // Find source entity location (if it's a company)
        // For now, we'll create arcs from a central point or from affected entities to each other
        if (targetLocation && event.affectedEntities.length > 1) {
          // Create arcs between affected entities
          event.affectedEntities.forEach(sourceEntityId => {
            if (sourceEntityId !== targetEntityId) {
              const sourceLocation = companyLocationMap.get(sourceEntityId);
              if (sourceLocation) {
                const color = event.impact === 'positive'
                  ? 'rgba(0, 255, 159, 0.6)'  // emerald
                  : event.impact === 'negative'
                  ? 'rgba(239, 68, 68, 0.6)'  // red
                  : 'rgba(148, 163, 184, 0.4)'; // gray

                arcs.push({
                  id: generateArcId(sourceLocation.lat, sourceLocation.lng, targetLocation.lat, targetLocation.lng, `snapshot-${event.title.replace(/\s+/g, '-')}`),
                  type: 'snapshot',
                  startLat: sourceLocation.lat,
                  startLng: sourceLocation.lng,
                  endLat: targetLocation.lat,
                  endLng: targetLocation.lng,
                  amount: event.magnitude * 100,
                  color,
                  label: event.title,
                });
              }
            }
          });
        }
      });
    });

    return arcs;
  }, [snapshot]);

  // Generate dynamic impact arcs based on macro variable changes
  const dynamicImpactArcs = useMemo(() => {
    const arcs: CapitalFlow[] = [];

    // Map sectors to their impacted macro variables
    const sectorMacroMap: Record<string, string[]> = {
      BANKING: ['fed_funds_rate', 'us_10y_yield', 'yield_curve', 'ted_spread', 'credit_spread_baa'],
      SEMICONDUCTOR: ['ai_investment', 'gpu_demand_index', 'dram_price_index', 'wafer_capacity_utilization', 'hbm_price_premium'],
      MANUFACTURING: ['container_rate_us_china', 'container_rate_eu_asia', 'air_freight_index', 'us_pmi_manufacturing', 'china_pmi_manufacturing'],
      COMMODITIES: ['wti_oil', 'brent_oil', 'iron_ore', 'copper', 'lithium', 'silver', 'gold'],
      REALESTATE: ['us_mortgage_rate_30y', 'us_home_price_index', 'commercial_real_estate_index', 'cap_rate'],
    };

    // For each sector, find affected companies and create arcs between them
    Object.entries(sectorMacroMap).forEach(([sector, macroVars]) => {
      // Calculate average impact for this sector
      const avgImpact = macroVars.reduce((sum, varId) => sum + (macroImpacts[varId] || 0), 0) / macroVars.length;

      if (avgImpact > 0.05) { // Only show if significant impact (>5% change)
        const sectorCompanies = companyPoints.filter(c => c.sector === sector);

        // Create arcs between top companies in the sector
        for (let i = 0; i < Math.min(sectorCompanies.length, 5); i++) {
          for (let j = i + 1; j < Math.min(sectorCompanies.length, 5); j++) {
            const company1 = sectorCompanies[i];
            const company2 = sectorCompanies[j];

            // Calculate brightness based on impact intensity
            const brightness = Math.min(1, avgImpact * 3); // 0 to 1
            const alpha = brightness * 0.8; // Max 0.8 opacity

            arcs.push({
              id: generateArcId(company1.lat, company1.lng, company2.lat, company2.lng, `dynamic-${sector}`),
              type: 'dynamic',
              startLat: company1.lat,
              startLng: company1.lng,
              endLat: company2.lat,
              endLng: company2.lng,
              amount: avgImpact * 100, // Use impact as amount for arc width
              color: `rgba(${getSectorRGB(sector)}, ${alpha})`,
              label: `${sector} Impact: ${(avgImpact * 100).toFixed(1)}%`,
            });
          }
        }
      }
    });

    return arcs;
  }, [macroImpacts, companyPoints]);

  // Filter capital flows based on selected sector
  const visibleFlows = useMemo(() => {
    if (!selectedSector) return CAPITAL_FLOWS;
    const relevantCodes = sectorCountries[selectedSector] || [];
    return CAPITAL_FLOWS.map(flow => {
      const startCountry = COUNTRIES.find(c => c.lat === flow.startLat && c.lng === flow.startLng);
      const endCountry = COUNTRIES.find(c => c.lat === flow.endLat && c.lng === flow.endLng);
      const isRelevant =
        (startCountry && relevantCodes.includes(startCountry.code)) ||
        (endCountry && relevantCodes.includes(endCountry.code));
      return {
        ...flow,
        color: isRelevant ? flow.color : 'rgba(100, 100, 100, 0.1)'
      };
    });
  }, [selectedSector]);

  // Convert Economic Flows to Globe arcs with smooth transitions
  const economicFlowArcs = useMemo(() => {
    if (!economicFlows || economicFlows.length === 0) return [];

    // Entity to location mapping (conceptual locations for economic entities)
    const entityLocationMap: Record<string, { lat: number; lng: number }> = {
      // Central Banks
      'Federal Reserve': { lat: 38.8951, lng: -77.0369 }, // Washington DC
      'European Central Bank': { lat: 50.1109, lng: 8.6821 }, // Frankfurt
      'Bank of Japan': { lat: 35.6762, lng: 139.6503 }, // Tokyo
      'People\'s Bank of China': { lat: 39.9042, lng: 116.4074 }, // Beijing

      // Sectors
      'Banking Sector': { lat: 40.7128, lng: -74.0060 }, // New York (Wall Street)
      'Corporate Sector': { lat: 37.7749, lng: -122.4194 }, // San Francisco (Silicon Valley)
      'Real Estate': { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      'Technology Sector': { lat: 37.3861, lng: -122.0839 }, // Mountain View
      'Semiconductor Industry': { lat: 37.5665, lng: 126.9780 }, // Seoul
      'Consumer Sector': { lat: 41.8781, lng: -87.6298 }, // Chicago
      'Employment': { lat: 38.9072, lng: -77.0369 }, // Washington DC

      // Markets
      'Money Supply (M2)': { lat: 40.7589, lng: -73.9851 }, // New York Fed
      'Equity Markets': { lat: 40.7128, lng: -74.0060 }, // NYSE
      'Crypto Markets': { lat: 37.7749, lng: -122.4194 }, // San Francisco
      'Bond Markets': { lat: 51.5074, lng: -0.1278 }, // London
      'Safe Havens (Bonds, Gold)': { lat: 47.3769, lng: 8.5417 }, // Zurich
      'Risk Assets': { lat: 1.3521, lng: 103.8198 }, // Singapore

      // Macro
      'GDP Growth': { lat: 38.8951, lng: -77.0369 }, // Washington DC
      'Corporate Earnings': { lat: 40.7128, lng: -74.0060 }, // New York
      'Market Volatility (VIX)': { lat: 41.8781, lng: -87.6298 }, // Chicago (CBOE)
    };

    const arcs: CapitalFlow[] = [];

    economicFlows.forEach(flow => {
      const fromLoc = entityLocationMap[flow.from];
      const toLoc = entityLocationMap[flow.to];

      if (fromLoc && toLoc) {
        // Color based on impact
        const color = flow.impact === 'positive'
          ? `rgba(0, 255, 159, ${Math.min(flow.magnitude / 100, 0.9)})` // Emerald
          : flow.impact === 'negative'
          ? `rgba(239, 68, 68, ${Math.min(flow.magnitude / 100, 0.9)})` // Red
          : `rgba(100, 116, 139, ${Math.min(flow.magnitude / 100, 0.7)})`; // Gray

        arcs.push({
          id: generateArcId(fromLoc.lat, fromLoc.lng, toLoc.lat, toLoc.lng, `economic-${flow.from.replace(/\s+/g, '-')}-${flow.to.replace(/\s+/g, '-')}`),
          type: 'economic',
          startLat: fromLoc.lat,
          startLng: fromLoc.lng,
          endLat: toLoc.lat,
          endLng: toLoc.lng,
          amount: flow.magnitude,
          color: color,
          label: `${flow.from} → ${flow.to}: ${flow.description} (${flow.magnitude.toFixed(0)} × ${flow.multiplier.toFixed(1)})`
        });
      }
    });

    return arcs;
  }, [economicFlows]);

  // UNIFIED VIEW: Combine ALL arc types regardless of view mode
  // Apply topic-based filtering via selectedSector instead
  const allArcs = useMemo(() => {
    // Always show all arc types in unified view
    const unifiedArcs = [
      ...visibleFlows,        // Capital flows (filtered by selectedSector)
      ...dynamicImpactArcs,   // Macro variable impact arcs
      ...snapshotImpactArcs,  // Time-based event arcs
      ...economicFlowArcs     // Economic flow arcs (Fed → Banks → Companies)
    ];

    // 🔍 Create a Set of relevant company IDs based on selected topic
    let relevantCompanyIds: Set<string> | null = null;
    if (selectedTopic && selectedTopic !== 'all') {
      relevantCompanyIds = new Set(
        companyPoints
          .filter(point => {
            const company = point.company;
            return company.topics && company.topics.includes(selectedTopic);
          })
          .map(point => point.id)
      );
    }

    // If a sector or topic is selected, filter arcs to only show relevant ones
    if (selectedSector || (selectedTopic && selectedTopic !== 'all')) {
      return unifiedArcs.map(arc => {
        // Keep economic flows and snapshot arcs (they're always relevant) but dim if topic filtered
        const isEconomicFlow = arc.label && (arc.label.includes('→') && arc.label.includes('×'));
        const isSnapshotArc = arc.label && !arc.label.includes('Impact') && !arc.label.includes('Capital') && !arc.label.includes('Trade');

        // 🔍 For topic filtering: dim arcs that don't connect relevant companies
        if (relevantCompanyIds && !isEconomicFlow && !isSnapshotArc) {
          // Check if this arc connects to any relevant companies
          // Arc labels contain entity IDs or can be matched against companyPoints
          const isRelevant = dynamicImpactArcs.includes(arc) || snapshotImpactArcs.includes(arc);

          if (!isRelevant) {
            // Dim the arc by reducing alpha
            return {
              ...arc,
              color: arc.color.replace(/[\d.]+\)$/, '0.15)') // Reduce alpha to 0.15
            };
          }
        }

        return arc;
      });
    }

    return unifiedArcs;
  }, [visibleFlows, dynamicImpactArcs, snapshotImpactArcs, economicFlowArcs, selectedSector, selectedTopic, companyPoints]); // 🔍 Added selectedTopic and companyPoints

  // Create pulsing rings for affected entities (problem indicators)
  // UNIFIED VIEW: Always show rings when snapshot has events
  const affectedEntityRings = useMemo(() => {
    if (!snapshot) return [];

    const rings: any[] = [];
    companyPoints.forEach(point => {
      if (point.isAffected && point.affectedByEvent) {
        const event = point.affectedByEvent;
        const ringColor = event.impact === 'positive'
          ? 'rgba(0, 255, 159, 0.8)'  // emerald for positive
          : event.impact === 'negative'
          ? 'rgba(239, 68, 68, 0.8)'  // red for negative
          : 'rgba(148, 163, 184, 0.6)'; // gray for neutral

        rings.push({
          lat: point.lat,
          lng: point.lng,
          maxR: 3, // Maximum ring radius
          propagationSpeed: 1.5, // How fast the ring expands
          repeatPeriod: 1200, // Repeat every 1.2 seconds
          color: ringColor,
          label: event.title,
        });
      }
    });

    return rings;
  }, [snapshot, companyPoints]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black">
      {/* Sector Focus Indicator */}
      {selectedSector && (
        <div className="absolute top-2 right-2 z-10 bg-accent-cyan/20 backdrop-blur border border-accent-cyan rounded-lg px-3 py-1.5">
          <span className="text-xs font-semibold text-accent-cyan">
            Focus: {selectedSector}
          </span>
        </div>
      )}

      {/* 🔍 Topic Filter Indicator */}
      {selectedTopic && selectedTopic !== 'all' && (
        <div className="absolute top-2 right-2 z-10 bg-accent-magenta/20 backdrop-blur border border-accent-magenta rounded-lg px-3 py-1.5" style={{ marginTop: selectedSector ? '3rem' : '0' }}>
          <span className="text-xs font-semibold text-accent-magenta">
            🔍 Topic: {selectedTopic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </span>
        </div>
      )}

      {/* Controls */}
      {showControls && (
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
          <div className="text-xs text-text-tertiary mb-2 font-semibold">View Mode</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setInternalViewMode('companies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'companies'
                  ? 'bg-accent-emerald text-black shadow-lg shadow-accent-emerald/50'
                  : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setInternalViewMode('m2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'm2'
                  ? 'bg-accent-cyan text-black shadow-lg shadow-accent-cyan/50'
                  : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              M2 Supply
            </button>
            <button
              onClick={() => setInternalViewMode('flows')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'flows'
                  ? 'bg-accent-magenta text-black shadow-lg shadow-accent-magenta/50'
                  : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Flows
            </button>
          </div>
        </div>

        {/* Legend - UNIFIED VIEW */}
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
          <div className="text-xs text-text-tertiary mb-2 font-semibold">Unified Globe Legend</div>
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
              <div className="w-8 h-0.5 bg-gradient-to-r from-accent-cyan to-transparent" />
              <span className="text-xs text-text-primary">Capital Flows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-accent-magenta to-transparent shadow-lg" style={{ boxShadow: '0 0 8px #E6007A' }} />
              <span className="text-xs text-accent-magenta font-semibold">💰 Economic Flows</span>
            </div>
            <div className="text-xs text-text-tertiary mt-2">
              Arc thickness = Flow intensity (self-attention style)
            </div>
          </div>
        </div>

        {/* Active Macro Impacts Indicator */}
        {dynamicImpactArcs.length > 0 && (
          <div className="bg-black/80 backdrop-blur border-2 border-accent-emerald rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <div className="text-xs font-bold text-accent-emerald">Active Macro Impacts</div>
            </div>
            <div className="space-y-1 text-xs">
              {Object.entries(macroImpacts)
                .filter(([_, impact]) => impact > 0.08)
                .slice(0, 5)
                .map(([varId, impact]) => {
                  const variable = MACRO_VARIABLES.find(v => v.id === varId);
                  if (!variable) return null;
                  return (
                    <div key={varId} className="flex justify-between items-center">
                      <span className="text-text-tertiary truncate max-w-[140px]">{variable.name}:</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="h-1 bg-gradient-to-r from-accent-emerald to-transparent rounded"
                          style={{ width: `${Math.min(impact * 100, 40)}px` }}
                        />
                        <span className="text-accent-emerald font-mono">{(impact * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              {Object.values(macroImpacts).filter(v => v > 0.08).length === 0 && (
                <div className="text-text-tertiary text-xs italic">
                  Adjust macro variables in Simulation to see impacts
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
          <div className="text-xs text-text-tertiary mb-2 font-semibold">Controls</div>
          <div className="space-y-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                autoRotate
                  ? 'bg-accent-emerald text-black'
                  : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {autoRotate ? '⏸ Pause Rotation' : '▶ Auto Rotate'}
            </button>
            <button
              onClick={() => {
                setSelectedCountry(null);
                setAutoRotate(true);
                if (globeRef.current) {
                  globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
                }
              }}
              className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-background-secondary text-text-secondary hover:text-text-primary transition-all"
            >
              🔄 Reset View
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Company Details */}
      {selectedCompany && (
        <div className="absolute top-4 right-4 z-10 w-80 bg-black/95 backdrop-blur border-2 border-accent-emerald rounded-lg p-4 shadow-2xl shadow-accent-emerald/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-accent-emerald">{selectedCompany.name_en || selectedCompany.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-text-tertiary">Ticker:</span>
                <span className="text-xs font-mono font-bold text-accent-cyan">{selectedCompany.ticker}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                  backgroundColor: `${getSectorColor(selectedCompany.sector)}20`,
                  color: getSectorColor(selectedCompany.sector),
                  border: `1px solid ${getSectorColor(selectedCompany.sector)}50`
                }}>
                  {selectedCompany.sector}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompany(null)}
              className="text-text-tertiary hover:text-accent-emerald transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-background-secondary rounded-lg p-2.5">
              <div className="text-xs text-text-tertiary mb-1">Revenue</div>
              <div className="text-sm font-bold text-accent-cyan">
                ${(selectedCompany.financials.revenue / 1000).toFixed(1)}B
              </div>
            </div>
            <div className="bg-background-secondary rounded-lg p-2.5">
              <div className="text-xs text-text-tertiary mb-1">Net Income</div>
              <div className="text-sm font-bold text-accent-emerald">
                ${(selectedCompany.financials.net_income / 1000).toFixed(1)}B
              </div>
            </div>
            <div className="bg-background-secondary rounded-lg p-2.5">
              <div className="text-xs text-text-tertiary mb-1">Total Assets</div>
              <div className="text-sm font-bold text-text-primary">
                ${(selectedCompany.financials.total_assets / 1000).toFixed(1)}B
              </div>
            </div>
            <div className="bg-background-secondary rounded-lg p-2.5">
              <div className="text-xs text-text-tertiary mb-1">ROE</div>
              <div className="text-sm font-bold text-accent-magenta">
                {selectedCompany.ratios.roe?.toFixed(1) || 'N/A'}%
              </div>
            </div>
          </div>

          {/* Key Ratios */}
          <div className="border-t border-border-primary pt-3 mb-3">
            <div className="text-xs font-semibold text-text-tertiary mb-2">Key Ratios</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-tertiary">D/E Ratio:</span>
                <span className="font-mono text-text-primary">{selectedCompany.ratios.de_ratio.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">ICR:</span>
                <span className="font-mono text-text-primary">{selectedCompany.ratios.icr.toFixed(1)}x</span>
              </div>
              {selectedCompany.ratios.roa && (
                <div className="flex justify-between">
                  <span className="text-text-tertiary">ROA:</span>
                  <span className="font-mono text-text-primary">{selectedCompany.ratios.roa.toFixed(1)}%</span>
                </div>
              )}
              {selectedCompany.ratios.pe_ratio && (
                <div className="flex justify-between">
                  <span className="text-text-tertiary">P/E:</span>
                  <span className="font-mono text-text-primary">{selectedCompany.ratios.pe_ratio.toFixed(1)}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Sector Specific Metrics */}
          {selectedCompany.sector_metrics && (
            <div className="border-t border-border-primary pt-3">
              <div className="text-xs font-semibold text-text-tertiary mb-2">Sector Metrics</div>
              <div className="space-y-1.5 text-xs">
                {selectedCompany.sector_metrics.production_volume && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Production:</span>
                    <span className="font-mono text-accent-cyan">
                      {selectedCompany.sector_metrics.production_volume} {
                        selectedCompany.sector === 'COMMODITIES' && selectedCompany.ticker.includes('ARAMCO') ? 'M barrels' :
                        selectedCompany.sector === 'COMMODITIES' && selectedCompany.id.includes('GOLD') ? 'M oz' :
                        'MT'
                      }
                    </span>
                  </div>
                )}
                {selectedCompany.sector_metrics.reserves && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Reserves:</span>
                    <span className="font-mono text-accent-emerald">{selectedCompany.sector_metrics.reserves} years</span>
                  </div>
                )}
                {selectedCompany.sector_metrics.extraction_cost && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Extraction Cost:</span>
                    <span className="font-mono text-accent-magenta">${selectedCompany.sector_metrics.extraction_cost}/unit</span>
                  </div>
                )}
                {selectedCompany.sector_metrics.nim && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">NIM:</span>
                    <span className="font-mono text-accent-cyan">{selectedCompany.sector_metrics.nim}%</span>
                  </div>
                )}
                {selectedCompany.sector_metrics.wafer_utilization && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Wafer Utilization:</span>
                    <span className="font-mono text-accent-emerald">{selectedCompany.sector_metrics.wafer_utilization}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {selectedCompany.location && (
            <div className="mt-3 pt-3 border-t border-border-primary text-xs text-text-tertiary">
              📍 {selectedCompany.country} • {selectedCompany.location.lat.toFixed(2)}°, {selectedCompany.location.lng.toFixed(2)}°
            </div>
          )}
        </div>
      )}

      {/* Country Details */}
      {selectedCountry && !selectedCompany && (
        <div className="absolute top-4 right-4 z-10 w-72 bg-black/90 backdrop-blur border border-accent-cyan rounded-lg p-4 shadow-2xl shadow-accent-cyan/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-accent-cyan">{selectedCountry.name}</h3>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-text-tertiary hover:text-accent-cyan transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border-primary">
              <span className="text-text-tertiary">Code:</span>
              <span className="text-text-primary font-mono font-semibold">{selectedCountry.code}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-tertiary">M2 Supply:</span>
              <span className="text-accent-cyan font-mono font-bold">${selectedCountry.m2Supply.toFixed(1)}T</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-tertiary">GDP:</span>
              <span className="text-accent-emerald font-mono font-bold">${selectedCountry.gdp.toFixed(1)}T</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-tertiary">M2/GDP Ratio:</span>
              <span className={`font-mono font-bold ${
                (selectedCountry.m2Supply / selectedCountry.gdp) > 2
                  ? 'text-status-danger'
                  : 'text-status-safe'
              }`}>
                {(selectedCountry.m2Supply / selectedCountry.gdp).toFixed(2)}x
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-border-primary">
              <div className="text-text-tertiary mb-2">Capital Flows:</div>
              {CAPITAL_FLOWS.filter(
                flow => flow.label.includes(selectedCountry.name)
              ).length > 0 ? (
                <div className="space-y-1">
                  {CAPITAL_FLOWS.filter(
                    flow => flow.label.includes(selectedCountry.name)
                  ).map((flow, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-text-primary">{flow.label}</span>
                      <span className="text-accent-cyan ml-2 font-mono">${flow.amount}B</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-text-tertiary text-xs">No major flows</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats - UNIFIED VIEW */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-text-tertiary">Companies</div>
            <div className="text-accent-emerald font-bold text-lg">
              {selectedSector ? companyPoints.filter(c => c.sector === selectedSector).length : companyPoints.length}
            </div>
          </div>
          <div>
            <div className="text-text-tertiary">Countries</div>
            <div className="text-accent-cyan font-bold text-lg">{visibleCountries.length}</div>
          </div>
          <div>
            <div className="text-text-tertiary">Total M2</div>
            <div className="text-accent-magenta font-bold text-lg">
              ${adjustedCountries.reduce((sum, c) => sum + c.m2Supply, 0).toFixed(1)}T
            </div>
          </div>
          <div>
            <div className="text-text-tertiary">Arcs</div>
            <div className="text-accent-yellow font-bold text-lg">{allArcs.length}</div>
          </div>
        </div>
      </div>

      {/* Globe */}
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0, 0, 0, 0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

        // 🔑 Points with Stable IDs (prevents cylinder re-rendering/"popping")
        // UNIFIED VIEW: Show BOTH companies AND countries simultaneously
        // Filter by selectedSector if a topic is selected
        pointsData={[
          ...companyPoints,
          ...visibleCountries.map(c => ({ ...c, type: 'country' })) // Add type marker
        ]}
        pointId="id" // CRITICAL: Use stable ID for point persistence
        pointLat="lat"
        pointLng="lng"
        pointAltitude={(d: any) => d.size * 0.01}
        pointRadius={(d: any) => {
          // Differentiate between companies (smaller) and countries (larger)
          const isCountry = d.type === 'country' || d.code; // Has type or country code
          return isCountry ? d.size * 0.5 : d.size * 0.4;
        }}
        pointColor={(d: any) => d.color}
        pointLabel={(d: any) => {
          // Detect if this is a company or country
          const isCountry = d.type === 'country' || d.code;

          if (isCountry) {
            // Country label
            return `
              <div style="background: rgba(0, 0, 0, 0.9); padding: 8px; border-radius: 6px; border: 1px solid #00E5FF;">
                <div style="color: #00E5FF; font-weight: bold; margin-bottom: 4px;">${d.name}</div>
                <div style="color: white; font-size: 12px;">M2: $${d.m2Supply?.toFixed(1)}T</div>
                <div style="color: #00FF9F; font-size: 12px;">GDP: $${d.gdp?.toFixed(1)}T</div>
              </div>
            `;
          } else {
            // Company label
            return `
              <div style="background: rgba(0, 0, 0, 0.95); padding: 10px; border-radius: 8px; border: 2px solid ${d.color};">
                <div style="color: ${d.color}; font-weight: bold; font-size: 14px; margin-bottom: 6px;">${d.name}</div>
                <div style="color: white; font-size: 11px; margin-bottom: 4px;">Ticker: <span style="color: #00E5FF;">${d.ticker || 'N/A'}</span></div>
                <div style="color: white; font-size: 11px; margin-bottom: 4px;">Sector: <span style="color: ${d.color};">${d.sector || 'N/A'}</span></div>
                <div style="color: white; font-size: 11px;">Impact: <span style="color: ${d.impact >= 0 ? '#00FF9F' : '#FF4444'};">${d.impact >= 0 ? '+' : ''}${(d.impact || 0).toFixed(2)}%</span></div>
              </div>
            `;
          }
        }}
        onPointClick={(point: any) => {
          // Detect if this is a company or country
          const isCountry = point.type === 'country' || point.code;

          if (isCountry) {
            handleCountryClick(point as Country);
          } else {
            setSelectedCompany(point.company);
            setSelectedCountry(null);
          }
        }}

        // 🔑 Arcs with Stable IDs (prevents "popping" during re-render)
        arcsData={allArcs}
        arcId="id" // CRITICAL: Use stable ID for arc persistence
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={(d: any) => {
          // 🔥 DYNAMIC REACTION: Arc color responds to simulation events
          const isEconomicFlow = d.type === 'economic';
          const isDynamicImpact = d.type === 'dynamic';
          const isSnapshotArc = d.type === 'snapshot';

          // Base color
          let color = d.color;

          // ✨ BRIGHTEN arcs during active events (simulation reaction)
          if (snapshot && snapshot.events.length > 0 && (isEconomicFlow || isDynamicImpact)) {
            // Parse RGBA to increase brightness
            const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgbaMatch) {
              const r = parseInt(rgbaMatch[1]);
              const g = parseInt(rgbaMatch[2]);
              const b = parseInt(rgbaMatch[3]);
              let alpha = parseFloat(rgbaMatch[4] || '1');

              // 🌟 Increase alpha by 50% during active simulation
              alpha = Math.min(alpha * 1.5, 1);
              color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
          }

          // 💥 GLOW effect for snapshot event arcs
          if (isSnapshotArc && snapshot) {
            const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgbaMatch) {
              const r = parseInt(rgbaMatch[1]);
              const g = parseInt(rgbaMatch[2]);
              const b = parseInt(rgbaMatch[3]);
              // Full brightness for active event arcs
              color = `rgba(${r}, ${g}, ${b}, 0.95)`;
            }
          }

          return color;
        }}
        arcStroke={(d: any) => {
          // 🔥 DYNAMIC REACTION: Arc thickness responds to simulation
          const isEconomicFlow = d.type === 'economic';
          const isDynamic = d.type === 'dynamic';
          const isSnapshot = d.type === 'snapshot';

          let baseStroke = 0.5; // 🔧 INCREASED from 0.1 to 0.5 (5x thicker base)

          if (isEconomicFlow) {
            // Attention-score-like thickness based on magnitude
            const magnitude = d.amount || 0;
            baseStroke = Math.min(0.8 + (magnitude / 100) * 3.0, 4.0); // 🔧 INCREASED range: 0.8-4.0

            // 🔥 THICKEN by 3x during active simulation (was 1.5x)
            if (snapshot && snapshot.events.length > 0) {
              baseStroke *= 3.0; // 🔧 INCREASED from 1.5 to 3.0
            }
          } else if (isDynamic) {
            baseStroke = Math.sqrt(d.amount) * 0.12; // 🔧 INCREASED from 0.04 to 0.12 (3x)

            // 🔥 THICKEN by 4x during macro changes (was 2x)
            if (Object.values(macroImpacts).some(v => v > 0.05)) {
              baseStroke *= 4.0; // 🔧 INCREASED from 2.0 to 4.0
            }
          } else if (isSnapshot) {
            // 💥 Snapshot event arcs are always thick and visible
            baseStroke = Math.max(2.0, d.amount * 0.03); // 🔧 INCREASED from 0.5 to 2.0
          } else {
            baseStroke = Math.sqrt(d.amount) * 0.08; // 🔧 INCREASED from 0.02 to 0.08 (4x)
          }

          return Math.min(baseStroke, 8.0); // 🔧 INCREASED cap from 2.5 to 8.0
        }}
        arcAltitude={(d: any) => {
          // Higher altitude for more important flows (self-attention style)
          const isEconomicFlow = d.label && (d.label.includes('→') && d.label.includes('×'));
          if (isEconomicFlow) {
            const magnitude = d.amount || 0;
            // magnitude 0-200 → altitude 0.1-0.4
            return 0.1 + (magnitude / 200) * 0.3;
          }
          return 0.2; // Default altitude
        }}
        arcDashLength={0.9} // Longer dashes for smoother flow
        arcDashGap={0.1} // Smaller gaps
        arcDashAnimateTime={(d: any) => {
          // Economic flows pulse faster (like attention weights updating)
          const isEconomicFlow = d.label && (d.label.includes('→') && d.label.includes('×'));
          const isDynamic = d.label && d.label.includes('Impact');

          if (isEconomicFlow) {
            // Faster animation for active economic flows (500-800ms)
            const magnitude = d.amount || 0;
            return Math.max(500, 1000 - magnitude * 3);
          } else if (isDynamic) {
            return 800; // Fast for macro impacts
          } else {
            return 1500; // Slower for static flows
          }
        }}
        arcTransitionDuration={1000} // Smooth fade in/out over 1 second
        arcLabel={(d: any) => {
          const isEconomicFlow = d.label && (d.label.includes('→') && d.label.includes('×'));
          const isDynamic = d.label && d.label.includes('Impact');

          if (isEconomicFlow) {
            // Parse magnitude from label
            const magnitude = d.amount || 0;
            const intensityColor = magnitude > 100 ? '#00FF9F' : magnitude > 50 ? '#FFD700' : '#06B6D4';

            return `
              <div style="background: rgba(0, 0, 0, 0.95); padding: 12px; border-radius: 8px; border: 2px solid ${intensityColor}; box-shadow: 0 0 20px ${intensityColor}80;">
                <div style="color: ${intensityColor}; font-weight: bold; margin-bottom: 6px; font-size: 13px;">⚡ Economic Flow</div>
                <div style="color: white; font-size: 11px; margin-bottom: 4px;">${d.label}</div>
                <div style="color: ${intensityColor}; font-size: 12px; font-weight: bold;">Intensity: ${magnitude.toFixed(0)}</div>
              </div>
            `;
          } else if (isDynamic) {
            return `
              <div style="background: rgba(0, 0, 0, 0.95); padding: 10px; border-radius: 8px; border: 2px solid #00FF9F;">
                <div style="color: #00FF9F; font-weight: bold; margin-bottom: 4px; font-size: 13px;">${d.label}</div>
                <div style="color: #FFD700; font-size: 11px; margin-top: 4px;">⚡ Macro Impact Active</div>
              </div>
            `;
          } else {
            return `
              <div style="background: rgba(0, 0, 0, 0.95); padding: 10px; border-radius: 8px; border: 2px solid #E6007A;">
                <div style="color: #E6007A; font-weight: bold; margin-bottom: 4px; font-size: 13px;">${d.label}</div>
                <div style="color: white; font-size: 12px;">Flow: $${d.amount}B</div>
              </div>
            `;
          }
        }}

        // Pulsing rings for affected entities (problem indicators)
        ringsData={affectedEntityRings}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor="color"
        ringLabel={(d: any) => `
          <div style="background: rgba(0, 0, 0, 0.95); padding: 8px; border-radius: 6px; border: 2px solid ${d.color};">
            <div style="color: ${d.color}; font-weight: bold; font-size: 12px;">⚠️ ${d.label}</div>
          </div>
        `}

        // Atmosphere
        atmosphereColor="#00E5FF"
        atmosphereAltitude={0.15}

        // Camera
        width={dimensions.width}
        height={dimensions.height}

        // Interaction
        onGlobeClick={handleGlobeClick}
        enablePointerInteraction={true}
      />
    </div>
  );
}
