'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { companies } from '@/data/companies';
import { MACRO_CATEGORIES } from '@/data/macroVariables';
import { useMacroStore } from '@/lib/store/macroStore';
import { useLevelStore } from '@/lib/store/levelStore';
import { useRelationshipStore, generateLinkId, getLinkColor } from '@/lib/store/relationshipStore';
import { getImpactColor, getImpactSizeMultiplier } from '@/lib/utils/levelImpactCalculation';
import { DateSnapshot } from '@/lib/utils/dateBasedSimulation';
import {
  NVIDIA,
  NVIDIA_PRODUCTS,
  NVIDIA_COMPONENTS,
  NVIDIA_SHAREHOLDERS,
  NVIDIA_CUSTOMERS,
  NVIDIA_RELATIONSHIPS,
  SK_HYNIX,
  EntityType,
} from '@/data/knowledgeGraph';
import {
  EXPANDED_RELATIONSHIPS,
  AMD,
  TSMC,
  MICROSOFT,
  APPLE,
  ASML,
  AMD_PRODUCTS,
  APPLE_PRODUCTS,
  MICROSOFT_PRODUCTS,
  ADVANCED_COMPONENTS,
  TECHNOLOGIES,
  HYPERSCALERS,
  ALL_EXPANDED_ENTITIES
} from '@/data/expandedKnowledgeGraph';
import SupplyChainDetailPanel from './SupplyChainDetailPanel';

// Dynamic import to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface GraphNode {
  id: string;
  name: string;
  level: 'macro' | 'sector' | 'company' | 'product' | 'component' | 'shareholder' | 'customer' | 'technology';
  sector?: string;
  category?: string;
  entityType?: EntityType;
  val: number; // Node size
  color: string;
  data?: any;
}

interface GraphLink {
  id?: string;
  source: string;
  target: string;
  type: 'impact' | 'supply' | 'ownership' | 'loan' | 'competition' | 'SUPPLIES' | 'MANUFACTURES' | 'BUYS' | 'USES' | 'REQUIRES' | 'PRODUCES' | 'DEVELOPS' | 'COMPETES_WITH';
  strength: number;
  color?: string;
  metadata?: any; // Supply chain metadata (annualValue, capacity, product, etc.)
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Level colors - Bloomberg style
const LEVEL_COLORS = {
  macro: '#FFD700',      // Gold
  sector: '#00E5FF',     // Cyan
  company: '#00FF9F',    // Emerald
};

const SECTOR_COLORS: Record<string, string> = {
  BANKING: '#06B6D4',
  REALESTATE: '#00FF9F',
  MANUFACTURING: '#8B5CF6',
  SEMICONDUCTOR: '#F59E0B',
  CRYPTO: '#E6007A',
  OPTIONS: '#39FF14',
};

// Generate graph data with 4-level ontology
function generateGraphData(): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Level 1: Macro Variables (6 key categories)
  const macroCategories = [
    'MONETARY_POLICY',
    'LIQUIDITY',
    'ECONOMIC_GROWTH',
    'COMMODITIES',
    'MARKET_SENTIMENT',
    'TECH_INNOVATION'
  ];

  macroCategories.forEach(category => {
    const categoryData = MACRO_CATEGORIES[category];
    if (categoryData) {
      nodes.push({
        id: `macro-${category}`,
        name: categoryData.label,
        level: 'macro',
        category,
        val: 30,
        color: LEVEL_COLORS.macro,
        data: { icon: categoryData.icon, category }
      });
    }
  });

  // Level 2: Sectors (4 main sectors)
  const sectors = ['BANKING', 'REALESTATE', 'MANUFACTURING', 'SEMICONDUCTOR'];
  sectors.forEach(sector => {
    nodes.push({
      id: `sector-${sector}`,
      name: sector,
      level: 'sector',
      sector,
      val: 20,
      color: SECTOR_COLORS[sector] || LEVEL_COLORS.sector,
      data: { sector }
    });

    // Connect macro to sectors (impact relationships)
    if (sector === 'BANKING' || sector === 'REALESTATE') {
      const source = 'macro-MONETARY_POLICY';
      const target = `sector-${sector}`;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'impact',
        strength: 5,
        color: 'rgba(255, 215, 0, 0.3)'
      });
    }
    if (sector === 'MANUFACTURING') {
      const source = 'macro-COMMODITIES';
      const target = `sector-${sector}`;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'impact',
        strength: 4,
        color: 'rgba(139, 92, 246, 0.3)'
      });
    }
    if (sector === 'SEMICONDUCTOR') {
      const source = 'macro-TECH_INNOVATION';
      const target = `sector-${sector}`;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'impact',
        strength: 4,
        color: 'rgba(245, 158, 11, 0.3)'
      });
    }
  });

  // Level 3: Companies (top 23 companies)
  const companySample = companies.slice(0, 23);
  companySample.forEach(company => {
    nodes.push({
      id: `company-${company.ticker}`,
      name: company.ticker,
      level: 'company',
      sector: company.sector,
      val: 10,
      color: SECTOR_COLORS[company.sector] || LEVEL_COLORS.company,
      data: company
    });

    // Connect to sector
    const source = `sector-${company.sector}`;
    const target = `company-${company.ticker}`;
    links.push({
      id: generateLinkId(source, target),
      source,
      target,
      type: 'ownership',
      strength: 2,
      color: 'rgba(0, 255, 159, 0.2)'
    });
  });

  // Add supply chain relationships (example: Samsung -> SK Hynix)
  const supplyChainPairs = [
    ['005930', '000660'], // Samsung -> SK Hynix
    ['066570', '035720'], // LG전자 -> Kakao
    ['000660', '000270'], // SK Hynix -> Kia
  ];

  supplyChainPairs.forEach(([from, to]) => {
    const fromCompany = companySample.find(c => c.ticker === from);
    const toCompany = companySample.find(c => c.ticker === to);
    if (fromCompany && toCompany) {
      const source = `company-${from}`;
      const target = `company-${to}`;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'supply',
        strength: 1,
        color: 'rgba(0, 229, 255, 0.4)'
      });
    }
  });

  // Add loan relationships (Banks -> Companies)
  const bankingCompanies = companySample.filter(c => c.sector === 'BANKING');
  const nonBankingCompanies = companySample.filter(c => c.sector !== 'BANKING').slice(0, 8);

  bankingCompanies.forEach((bank, idx) => {
    // Each bank lends to 2-3 companies
    const startIdx = idx * 2;
    nonBankingCompanies.slice(startIdx, startIdx + 3).forEach(company => {
      const source = `company-${bank.ticker}`;
      const target = `company-${company.ticker}`;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'loan',
        strength: 1.5,
        color: 'rgba(255, 215, 0, 0.35)'
      });
    });
  });

  // Add competition relationships (same sector companies)
  const competitionPairs = [
    ['005930', '000660'], // Samsung vs SK Hynix (Semiconductor)
    ['086790', '035420'], // KB Financial vs Shinhan (Banking)
    ['051910', '034730'], // LG Chem vs SK (Manufacturing)
  ];

  competitionPairs.forEach(([from, to]) => {
    const company1 = companySample.find(c => c.ticker === from);
    const company2 = companySample.find(c => c.ticker === to);
    if (company1 && company2) {
      const source = `company-${from}`;
      const target = `company-${to}`;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'competition',
        strength: 0.8,
        color: 'rgba(239, 68, 68, 0.4)'
      });
    }
  });

  // ====================================
  // KNOWLEDGE GRAPH: Deep Ontology
  // ====================================

  // Add Nvidia entity
  nodes.push({
    id: NVIDIA.id,
    name: NVIDIA.name,
    level: 'company',
    sector: 'SEMICONDUCTOR',
    val: 35,
    color: '#00FF00',
    data: NVIDIA,
  });

  // Add Products (Level 4)
  NVIDIA_PRODUCTS.forEach(product => {
    nodes.push({
      id: product.id,
      name: product.name,
      level: 'product',
      entityType: 'PRODUCT',
      val: 15,
      color: '#FFAA00',
      data: product,
    });

    // Link: Nvidia PRODUCES Product
    links.push({
      id: generateLinkId(NVIDIA.id, product.id),
      source: NVIDIA.id,
      target: product.id,
      type: 'supply',
      strength: 2,
      color: 'rgba(255, 170, 0, 0.6)',
    });
  });

  // Add Components (Level 5)
  NVIDIA_COMPONENTS.forEach(component => {
    nodes.push({
      id: component.id,
      name: component.name,
      level: 'component',
      entityType: 'COMPONENT',
      val: 10,
      color: '#FF6B00',
      data: component,
    });

    // Link: H100 USES HBM3E (example)
    if (component.id === 'component-hbm3e') {
      const source = 'product-h100';
      const target = component.id;
      links.push({
        id: generateLinkId(source, target),
        source,
        target,
        type: 'supply',
        strength: 1.5,
        color: 'rgba(255, 107, 0, 0.5)',
      });
    }
  });

  // Add SK Hynix (supplier of HBM)
  nodes.push({
    id: SK_HYNIX.id,
    name: SK_HYNIX.name,
    level: 'company',
    sector: 'SEMICONDUCTOR',
    val: 25,
    color: '#F59E0B',
    data: SK_HYNIX,
  });

  // Link: SK Hynix SUPPLIES HBM3E
  links.push({
    id: generateLinkId(SK_HYNIX.id, 'component-hbm3e'),
    source: SK_HYNIX.id,
    target: 'component-hbm3e',
    type: 'supply',
    strength: 3,
    color: 'rgba(245, 158, 11, 0.7)',
  });

  // Add Shareholders (Level 7)
  NVIDIA_SHAREHOLDERS.forEach(shareholder => {
    nodes.push({
      id: shareholder.id,
      name: shareholder.name,
      level: 'shareholder',
      entityType: 'SHAREHOLDER',
      val: 12,
      color: '#9333EA',
      data: shareholder,
    });

    // Link: Shareholder OWNS Nvidia
    links.push({
      id: generateLinkId(shareholder.id, NVIDIA.id),
      source: shareholder.id,
      target: NVIDIA.id,
      type: 'ownership',
      strength: (shareholder.metadata?.stake || 1) / 10,
      color: 'rgba(147, 51, 234, 0.5)',
    });
  });

  // Add Customers (Level 8)
  NVIDIA_CUSTOMERS.forEach(customer => {
    nodes.push({
      id: customer.id,
      name: customer.name,
      level: 'customer',
      entityType: 'CUSTOMER',
      val: 18,
      color: '#06B6D4',
      data: customer,
    });

    // Link: Customer BUYS H100
    links.push({
      id: generateLinkId(customer.id, 'product-h100'),
      source: customer.id,
      target: 'product-h100',
      type: 'supply',
      strength: 2,
      color: 'rgba(6, 182, 212, 0.5)',
    });
  });

  // Add expanded knowledge graph entities (AMD, TSMC, Microsoft, Apple, etc.)
  ALL_EXPANDED_ENTITIES.forEach(entity => {
    const level = mapEntityTypeToLevel(entity.type);
    const nodeColor = getNodeColorByType(entity.type, entity.metadata?.sector);
    const nodeSize = getNodeSizeByEntity(entity);

    nodes.push({
      id: entity.id,
      name: entity.name,
      level: level as any,
      entityType: entity.type,
      sector: entity.metadata?.sector,
      val: nodeSize,
      color: nodeColor,
      data: entity.metadata
    });
  });

  // Add expanded knowledge graph relationships with supply chain metadata
  EXPANDED_RELATIONSHIPS.forEach(relationship => {
    // Only add if both source and target exist as nodes
    const sourceExists = nodes.some(n => n.id === relationship.source);
    const targetExists = nodes.some(n => n.id === relationship.target);

    if (sourceExists && targetExists) {
      links.push({
        id: relationship.id,
        source: relationship.source,
        target: relationship.target,
        type: relationship.type as any,
        strength: relationship.weight * 2, // Scale weight to strength
        color: getLinkColorByType(relationship.type),
        metadata: relationship.metadata, // Include all supply chain metadata
      });
    }
  });

  return { nodes, links };
}

// Helper: Map entity type to graph level
function mapEntityTypeToLevel(entityType: EntityType): string {
  const levelMap: Record<string, string> = {
    COMPANY: 'company',
    PRODUCT: 'product',
    COMPONENT: 'component',
    SHAREHOLDER: 'shareholder',
    CUSTOMER: 'customer',
    TECHNOLOGY: 'technology',
    SECTOR: 'sector',
    MACRO: 'macro'
  };
  return levelMap[entityType] || 'company';
}

// Helper: Get node color by entity type and sector
function getNodeColorByType(entityType: EntityType, sector?: string): string {
  if (entityType === 'COMPANY' && sector) {
    return SECTOR_COLORS[sector] || '#00FF9F';
  }

  const typeColors: Record<string, string> = {
    PRODUCT: '#FFD700',        // Gold
    COMPONENT: '#FF6B00',      // Orange
    SHAREHOLDER: '#9333EA',    // Purple
    CUSTOMER: '#06B6D4',       // Cyan
    TECHNOLOGY: '#6366F1',     // Indigo
    SECTOR: '#00E5FF',         // Cyan
    MACRO: '#FFD700'           // Gold
  };

  return typeColors[entityType] || '#FFFFFF';
}

// Helper: Get node size by entity type
function getNodeSizeByType(entityType: EntityType): number {
  const sizeMap: Record<string, number> = {
    COMPANY: 20,
    PRODUCT: 15,
    COMPONENT: 12,
    TECHNOLOGY: 18,
    SHAREHOLDER: 16,
    CUSTOMER: 18,
    SECTOR: 25,
    MACRO: 30
  };
  return sizeMap[entityType] || 15;
}

// Helper: Get node size based on entity attributes (revenue, market cap, etc.)
function getNodeSizeByEntity(entity: any): number {
  const baseSize = getNodeSizeByType(entity.type);

  // Scale companies by market cap
  if (entity.type === 'COMPANY' && entity.metadata?.marketCap) {
    const marketCap = entity.metadata.marketCap; // in millions
    // Log scale for market cap (0.5B - 3T range)
    const scaleFactor = Math.log10(marketCap / 100000) / 2; // Normalize to ~1-2 range
    return baseSize * Math.max(0.7, Math.min(2.5, scaleFactor));
  }

  // Scale products by price
  if (entity.type === 'PRODUCT' && entity.metadata?.price) {
    const price = entity.metadata.price;
    // Higher priced products are larger
    if (price > 10000) {
      return baseSize * 1.5; // H100, MI300X
    } else if (price > 1000) {
      return baseSize * 1.2; // iPhone, High-end chips
    }
  }

  // Scale shareholders by stake
  if (entity.type === 'SHAREHOLDER' && entity.metadata?.stake) {
    const stake = entity.metadata.stake; // percentage
    return baseSize * (1 + stake / 20); // 8% stake = 1.4x size
  }

  // Scale customers by AI spend
  if (entity.type === 'CUSTOMER' && entity.metadata?.aiSpend) {
    const aiSpend = entity.metadata.aiSpend; // in dollars
    if (aiSpend > 5_000_000_000) {
      return baseSize * 1.8; // Microsoft, Amazon
    } else if (aiSpend > 2_000_000_000) {
      return baseSize * 1.4; // Meta, Google
    }
  }

  return baseSize;
}

// Helper: Get link color by relationship type
function getLinkColorByType(type: string): string {
  const colorMap: Record<string, string> = {
    SUPPLIES: 'rgba(0, 229, 255, 0.6)',        // Cyan
    MANUFACTURES: 'rgba(245, 158, 11, 0.6)',   // Orange
    BUYS: 'rgba(16, 185, 129, 0.6)',           // Green
    USES: 'rgba(139, 92, 246, 0.6)',           // Purple
    REQUIRES: 'rgba(230, 0, 122, 0.6)',        // Pink
    PRODUCES: 'rgba(255, 170, 0, 0.6)',        // Amber
    DEVELOPS: 'rgba(99, 102, 241, 0.6)',       // Indigo
    COMPETES_WITH: 'rgba(239, 68, 68, 0.5)',   // Red
  };
  return colorMap[type] || 'rgba(255, 255, 255, 0.3)';
}

interface ForceNetworkGraph3DProps {
  selectedSector?: string | null;
  showControls?: boolean;
  snapshot?: DateSnapshot | null;
}

export default function ForceNetworkGraph3D({
  selectedSector = null,
  showControls = true,
  snapshot = null
}: ForceNetworkGraph3DProps) {
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'macro' | 'sector' | 'company'>('all');
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [hoverLink, setHoverLink] = useState<GraphLink | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const calculatedImpacts = useMacroStore(state => state.calculatedImpacts);
  const entityImpacts = useLevelStore(state => state.entityImpacts);
  const getEntityImpact = useLevelStore(state => state.getEntityImpact);
  const {
    editedRelationships,
    getRelationshipStrength,
    isRelationshipEdited,
    isRelationshipRemoved,
    editRelationship,
    removeRelationship,
    restoreRelationship,
  } = useRelationshipStore();

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

  useEffect(() => {
    const data = generateGraphData();
    setGraphData(data);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      // 🔧 REDUCED from -300 to -100: Prevents "popping" and node explosion
      fgRef.current.d3Force('charge').strength(-100);
      fgRef.current.d3Force('link').distance(100);

      // Add radial positioning force for better clustering
      fgRef.current.d3Force('radial', null);

      // 🔧 FIXED: Use d3.forceCollide instead of modifying charge
      // Prevents nodes from overlapping without causing explosion
      const d3 = fgRef.current.d3;
      if (d3 && d3.forceCollide) {
        fgRef.current.d3Force('collision', d3.forceCollide().radius(20).strength(0.7));
      }

      // Group nodes by level in concentric circles
      fgRef.current.d3Force('center-x', (node: any) => {
        const radius = node.level === 'macro' ? 0 : node.level === 'sector' ? 300 : 600;
        return radius * Math.cos(node.angle || 0);
      });

      fgRef.current.d3Force('center-y', (node: any) => {
        const radius = node.level === 'macro' ? 0 : node.level === 'sector' ? 300 : 600;
        return radius * Math.sin(node.angle || 0);
      });
    }
  }, []);

  const filteredData = useMemo(() => {
    // Apply level-specific impacts to nodes
    const nodesWithImpact = graphData.nodes.map(node => {
      // Get level impact for this entity (if it exists in knowledge graph)
      const entityImpact = getEntityImpact(node.id);

      let impactSize = node.val;
      let impactColor = node.color;

      if (entityImpact && Math.abs(entityImpact.impactScore) > 0.05) {
        // Apply impact to node size and color
        impactSize = node.val * getImpactSizeMultiplier(entityImpact.impactScore);
        impactColor = getImpactColor(entityImpact.impactScore);
      }

      // Override with snapshot data if available (higher priority)
      if (snapshot) {
        const snapshotEntity = snapshot.entityValues.get(node.id);
        if (snapshotEntity) {
          impactSize = snapshotEntity.size * node.val; // Use snapshot size
          impactColor = snapshotEntity.color; // Use snapshot color
        }
      }

      return {
        ...node,
        val: impactSize,
        color: impactColor,
        levelImpact: entityImpact, // Store for tooltip
      };
    });

    // Filter by level if needed
    if (filterLevel === 'all') {
      return { nodes: nodesWithImpact, links: graphData.links };
    }

    const filteredNodes = nodesWithImpact.filter(n => n.level === filterLevel);
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(
      l => typeof l.source === 'string'
        ? filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
        : filteredNodeIds.has((l.source as any).id) && filteredNodeIds.has((l.target as any).id)
    );
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, filterLevel, entityImpacts, getEntityImpact, snapshot]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);

    // Highlight connected nodes
    const connectedNodeIds = new Set<string>();
    const connectedLinks = new Set<GraphLink>();

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      if (sourceId === node.id) {
        connectedNodeIds.add(targetId);
        connectedLinks.add(link);
      }
      if (targetId === node.id) {
        connectedNodeIds.add(sourceId);
        connectedLinks.add(link);
      }
    });

    connectedNodeIds.add(node.id);
    setHighlightNodes(connectedNodeIds);
    setHighlightLinks(connectedLinks);
  }, [graphData.links]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoverNode(node);
  }, []);

  const handleLinkClick = useCallback((link: GraphLink) => {
    setSelectedLink(link);
    setSelectedNode(null); // Clear node selection when clicking link
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  const handleLinkHover = useCallback((link: GraphLink | null) => {
    setHoverLink(link);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedLink(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black">
      {/* Controls */}
      {showControls && (
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
          <div className="text-xs text-text-tertiary mb-2 font-semibold">Filter by Level</div>
          <div className="flex gap-2">
            {(['all', 'macro', 'sector', 'company'] as const).map(level => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterLevel === level
                    ? 'bg-accent-cyan text-black shadow-lg shadow-accent-cyan/50'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                }`}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Node Legend */}
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
          <div className="text-xs text-text-tertiary mb-2 font-semibold">Nodes</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: LEVEL_COLORS.macro, boxShadow: `0 0 10px ${LEVEL_COLORS.macro}` }} />
              <span className="text-xs text-text-primary">Macro Variables</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: LEVEL_COLORS.sector, boxShadow: `0 0 10px ${LEVEL_COLORS.sector}` }} />
              <span className="text-xs text-text-primary">Sectors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: LEVEL_COLORS.company, boxShadow: `0 0 10px ${LEVEL_COLORS.company}` }} />
              <span className="text-xs text-text-primary">Companies</span>
            </div>
          </div>
        </div>

        {/* Link Legend */}
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
          <div className="text-xs text-text-tertiary mb-2 font-semibold">Relationships</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: 'rgba(255, 215, 0, 0.8)' }} />
              <span className="text-xs text-text-primary">Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: 'rgba(0, 255, 159, 0.8)' }} />
              <span className="text-xs text-text-primary">Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: 'rgba(0, 229, 255, 0.8)' }} />
              <span className="text-xs text-text-primary">Supply Chain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: 'rgba(255, 215, 0, 0.7)' }} />
              <span className="text-xs text-text-primary">Loan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'rgba(239, 68, 68, 0.8)' }} />
              <span className="text-xs text-text-primary">Competition</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Node Details */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 w-72 bg-black/90 backdrop-blur border border-accent-cyan rounded-lg p-4 shadow-2xl shadow-accent-cyan/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-accent-cyan">{selectedNode.name}</h3>
            <button
              onClick={() => {
                setSelectedNode(null);
                setHighlightNodes(new Set());
                setHighlightLinks(new Set());
              }}
              className="text-text-tertiary hover:text-accent-cyan transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border-primary">
              <span className="text-text-tertiary">Level:</span>
              <span className="text-text-primary font-semibold uppercase">{selectedNode.level}</span>
            </div>

            {selectedNode.level === 'company' && selectedNode.data && (
              <>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-tertiary">Name:</span>
                  <span className="text-text-primary font-semibold">{selectedNode.data.name}</span>
                </div>
                {selectedNode.data.sector && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-tertiary">Sector:</span>
                    <span className="text-accent-cyan">{selectedNode.data.sector}</span>
                  </div>
                )}
                {selectedNode.data.financials?.revenue && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-tertiary">Revenue:</span>
                    <span className="text-accent-emerald font-mono">${selectedNode.data.financials.revenue.toLocaleString()}M</span>
                  </div>
                )}
                {selectedNode.data.financials?.net_income && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-tertiary">Net Income:</span>
                    <span className="text-accent-emerald font-mono">${selectedNode.data.financials.net_income.toLocaleString()}M</span>
                  </div>
                )}
                {selectedNode.data.ratios?.icr && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-tertiary">ICR:</span>
                    <span className={`font-mono ${selectedNode.data.ratios.icr > 2.5 ? 'text-status-safe' : 'text-status-caution'}`}>
                      {selectedNode.data.ratios.icr.toFixed(2)}x
                    </span>
                  </div>
                )}

                {/* Show macro impact */}
                {selectedNode.data.sector && (
                  <div className="mt-3 pt-3 border-t border-border-primary">
                    <div className="text-text-tertiary mb-1">Macro Impact:</div>
                    {(() => {
                      let impact = 0;
                      if (selectedNode.data.sector === 'BANKING') impact = calculatedImpacts.banking;
                      else if (selectedNode.data.sector === 'REALESTATE') impact = calculatedImpacts.realEstate;
                      else if (selectedNode.data.sector === 'MANUFACTURING') impact = calculatedImpacts.manufacturing;
                      else if (selectedNode.data.sector === 'SEMICONDUCTOR') impact = calculatedImpacts.semiconductor;

                      return (
                        <div className={`text-lg font-bold ${impact >= 0 ? 'text-status-safe' : 'text-status-danger'}`}>
                          {impact >= 0 ? '+' : ''}{impact.toFixed(2)}%
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {selectedNode.level === 'sector' && (
              <div className="mt-3 pt-3 border-t border-border-primary">
                <div className="text-text-tertiary mb-1">Sector Impact:</div>
                {(() => {
                  let impact = 0;
                  if (selectedNode.sector === 'BANKING') impact = calculatedImpacts.banking;
                  else if (selectedNode.sector === 'REALESTATE') impact = calculatedImpacts.realEstate;
                  else if (selectedNode.sector === 'MANUFACTURING') impact = calculatedImpacts.manufacturing;
                  else if (selectedNode.sector === 'SEMICONDUCTOR') impact = calculatedImpacts.semiconductor;

                  return (
                    <div className={`text-xl font-bold ${impact >= 0 ? 'text-status-safe' : 'text-status-danger'}`}>
                      {impact >= 0 ? '+' : ''}{impact.toFixed(2)}%
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="pt-2 border-t border-border-primary">
              <div className="text-text-tertiary mb-1">Connections:</div>
              <div className="text-accent-cyan font-semibold">
                {highlightNodes.size - 1} connected nodes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supply Chain Detail Panel */}
      {selectedLink && (
        <SupplyChainDetailPanel
          link={selectedLink}
          onClose={() => setSelectedLink(null)}
        />
      )}

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-text-tertiary">Nodes</div>
            <div className="text-accent-cyan font-bold text-lg">{filteredData.nodes.length}</div>
          </div>
          <div>
            <div className="text-text-tertiary">Links</div>
            <div className="text-accent-magenta font-bold text-lg">{filteredData.links.length}</div>
          </div>
          <div>
            <div className="text-text-tertiary">Levels</div>
            <div className="text-accent-emerald font-bold text-lg">3</div>
          </div>
        </div>
      </div>

      {/* Force Graph */}
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="name"
        nodeVal="val"
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={50}
        nodeColor={(node: any) => {
          const n = node as GraphNode;

          // Sector focus mode
          if (selectedSector) {
            // Highlight nodes related to selected sector
            if (n.level === 'sector' && n.sector === selectedSector) {
              return n.color; // Full brightness for selected sector
            } else if (n.level === 'company' && n.sector === selectedSector) {
              return n.color; // Full brightness for companies in sector
            } else if (n.level === 'macro') {
              // Check if macro variable affects selected sector
              const affectsSector = graphData.links.some(link => {
                const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
                return link.source === n.id && targetId === `sector-${selectedSector}`;
              });
              return affectsSector ? n.color : 'rgba(100, 100, 100, 0.2)';
            } else {
              return 'rgba(100, 100, 100, 0.2)'; // Dim out unrelated nodes
            }
          }

          // Node click highlight mode
          if (highlightNodes.size > 0) {
            return highlightNodes.has(n.id) ? n.color : 'rgba(100, 100, 100, 0.3)';
          }

          return n.color;
        }}
        nodeOpacity={1}
        nodeResolution={32}
        linkColor={(link: any) => {
          // Check edit status first
          if (link.id) {
            if (isRelationshipRemoved(link.id)) {
              return 'rgba(239, 68, 68, 0.3)'; // Red for removed
            }
            if (isRelationshipEdited(link.id)) {
              return 'rgba(34, 197, 94, 0.7)'; // Green for edited
            }
          }

          // Sector focus mode
          if (selectedSector) {
            const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
            const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

            // Highlight links connected to selected sector
            const isRelated =
              sourceId === `sector-${selectedSector}` ||
              targetId === `sector-${selectedSector}` ||
              sourceId.includes(`company-`) && graphData.nodes.find(n => n.id === sourceId && n.sector === selectedSector) ||
              targetId.includes(`company-`) && graphData.nodes.find(n => n.id === targetId && n.sector === selectedSector);

            return isRelated ? link.color : 'rgba(100, 100, 100, 0.05)';
          }

          // Node click highlight mode
          if (highlightLinks.size > 0) {
            return highlightLinks.has(link as GraphLink) ? link.color : 'rgba(100, 100, 100, 0.1)';
          }

          return link.color || 'rgba(255, 255, 255, 0.2)';
        }}
        linkWidth={(link: any) => {
          const baseWidth = link.strength || 1;
          // Make edited links thicker
          if (link.id && isRelationshipEdited(link.id)) {
            return baseWidth * 1.5;
          }
          return baseWidth;
        }}
        linkOpacity={(link: any) => {
          // Dimout removed links
          if (link.id && isRelationshipRemoved(link.id)) {
            return 0.1;
          }
          return 0.6;
        }}
        linkDirectionalParticles={(link: any) => {
          // More particles for edited links
          if (link.id && isRelationshipEdited(link.id)) {
            return 4;
          }
          return 2;
        }}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkCurvature={(link: any) => {
          // Add natural curves to links based on relationship type
          const supplyChainTypes = ['SUPPLIES', 'MANUFACTURES', 'BUYS', 'USES', 'REQUIRES', 'supply'];
          if (supplyChainTypes.includes(link.type)) {
            return 0.25; // Smooth curve for supply chain
          } else if (link.type === 'impact') {
            return 0.15; // Gentle curve for impact relationships
          } else if (link.type === 'COMPETES_WITH' || link.type === 'competition') {
            return 0.4; // Strong curve for competition
          }
          return 0.2; // Default curve
        }}
        linkWidth={(link: any) => {
          // Link width based on strength and type
          const baseWidth = link.strength / 5; // Scale down strength

          // Thicker lines for critical supply chain links
          if (link.metadata?.critical) {
            return baseWidth * 1.5;
          }

          // Edited links are thicker
          if (link.id && isRelationshipEdited(link.id)) {
            return baseWidth * 1.3;
          }

          return Math.max(baseWidth, 0.5); // Minimum width
        }}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onLinkClick={handleLinkClick}
        onLinkHover={handleLinkHover}
        onBackgroundClick={handleBackgroundClick}
        backgroundColor="rgba(0, 0, 0, 0)"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        controlType="orbit"
      />
    </div>
  );
}
