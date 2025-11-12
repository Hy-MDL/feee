'use client';

import React, { useState } from 'react';
import { ArrowRight, Factory, Cpu, Zap, TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';

interface SupplyChainNode {
  id: string;
  name: string;
  type: 'equipment' | 'manufacturer' | 'component' | 'product' | 'customer';
  icon: React.ReactNode;
  details: {
    role: string;
    marketShare?: string;
    leadTime?: string;
    cost?: string;
    risk?: 'low' | 'medium' | 'high' | 'critical';
  };
  position: { x: number; y: number };
}

interface SupplyChainLink {
  from: string;
  to: string;
  label: string;
  strength: number; // 0-1
  bottleneck?: boolean;
}

interface SupplyChainDiagramProps {
  nodes: SupplyChainNode[];
  links: SupplyChainLink[];
  title?: string;
  description?: string;
}

export default function SupplyChainDiagram({
  nodes,
  links,
  title = 'Supply Chain Analysis',
  description,
}: SupplyChainDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const riskColors = {
    low: 'border-green-500/50 bg-green-500/10 text-green-400',
    medium: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    high: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
    critical: 'border-red-500/50 bg-red-500/10 text-red-400',
  };

  const typeColors = {
    equipment: 'border-purple-500/30 bg-purple-500/5',
    manufacturer: 'border-blue-500/30 bg-blue-500/5',
    component: 'border-cyan-500/30 bg-cyan-500/5',
    product: 'border-green-500/30 bg-green-500/5',
    customer: 'border-orange-500/30 bg-orange-500/5',
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const relatedLinks = selectedNode
    ? links.filter(l => l.from === selectedNode || l.to === selectedNode)
    : [];

  return (
    <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>

      {/* Main Diagram */}
      <div className="relative bg-background-primary border border-border-secondary rounded-lg p-8 mb-6 overflow-auto">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
            </marker>
            <marker
              id="arrowhead-bottleneck"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
          {/* Draw links */}
          {links.map((link, idx) => {
            const fromNode = nodes.find(n => n.id === link.from);
            const toNode = nodes.find(n => n.id === link.to);

            // Defensive: check both node existence AND position existence
            if (!fromNode || !toNode || !fromNode.position || !toNode.position) {
              console.warn(`SupplyChainDiagram: Missing node or position for link ${link.from} -> ${link.to}`);
              return null;
            }

            const isHighlighted =
              selectedNode === link.from || selectedNode === link.to;
            const strokeColor = link.bottleneck
              ? '#ef4444'
              : isHighlighted
              ? '#06b6d4'
              : '#64748b';
            const strokeWidth = isHighlighted ? 3 : 2;
            const opacity = !selectedNode || isHighlighted ? 1 : 0.3;

            return (
              <g key={idx} opacity={opacity}>
                <line
                  x1={fromNode.position.x + 100}
                  y1={fromNode.position.y + 40}
                  x2={toNode.position.x}
                  y2={toNode.position.y + 40}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={link.bottleneck ? '5,5' : 'none'}
                  markerEnd={`url(#${link.bottleneck ? 'arrowhead-bottleneck' : 'arrowhead'})`}
                />
                {/* Link label */}
                <text
                  x={(fromNode.position.x + toNode.position.x + 100) / 2}
                  y={(fromNode.position.y + toNode.position.y + 80) / 2 - 10}
                  fill={strokeColor}
                  fontSize="12"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {link.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative" style={{ minHeight: '400px', position: 'relative' }}>
          {nodes.map(node => {
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isConnected =
              selectedNode &&
              relatedLinks.some(l => l.from === node.id || l.to === node.id);
            const opacity = !selectedNode || isSelected || isConnected ? 1 : 0.4;

            return (
              <div
                key={node.id}
                className={`absolute cursor-pointer transition-all ${typeColors[node.type]} border-2 rounded-lg p-3 w-48`}
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  opacity,
                  transform: isHovered || isSelected ? 'scale(1.05)' : 'scale(1)',
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded bg-background-tertiary flex items-center justify-center">
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {node.name}
                    </h3>
                    <p className="text-xs text-text-secondary">{node.details.role}</p>
                  </div>
                </div>

                {/* Risk Badge */}
                {node.details.risk && (
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${riskColors[node.details.risk]}`}>
                    {node.details.risk === 'critical' && <AlertTriangle className="w-3 h-3" />}
                    {node.details.risk.toUpperCase()}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="mt-2 text-xs text-text-secondary space-y-1">
                  {node.details.marketShare && (
                    <div>Share: {node.details.marketShare}</div>
                  )}
                  {node.details.leadTime && (
                    <div>Lead: {node.details.leadTime}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNodeData && (
        <div className="bg-background-tertiary border border-border-primary rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-background-secondary flex items-center justify-center">
                {selectedNodeData.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedNodeData.name}</h3>
                <p className="text-sm text-text-secondary">{selectedNodeData.details.role}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-text-secondary hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {selectedNodeData.details.marketShare && (
              <div>
                <div className="text-xs text-text-tertiary mb-1">Market Share</div>
                <div className="text-sm font-semibold text-white">
                  {selectedNodeData.details.marketShare}
                </div>
              </div>
            )}
            {selectedNodeData.details.leadTime && (
              <div>
                <div className="text-xs text-text-tertiary mb-1">Lead Time</div>
                <div className="text-sm font-semibold text-white">
                  {selectedNodeData.details.leadTime}
                </div>
              </div>
            )}
            {selectedNodeData.details.cost && (
              <div>
                <div className="text-xs text-text-tertiary mb-1">Cost Impact</div>
                <div className="text-sm font-semibold text-white">
                  {selectedNodeData.details.cost}
                </div>
              </div>
            )}
            {selectedNodeData.details.risk && (
              <div>
                <div className="text-xs text-text-tertiary mb-1">Supply Risk</div>
                <div className={`text-sm font-semibold inline-flex items-center gap-1 ${riskColors[selectedNodeData.details.risk].split(' ')[2]}`}>
                  {selectedNodeData.details.risk === 'critical' && (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {selectedNodeData.details.risk.charAt(0).toUpperCase() +
                    selectedNodeData.details.risk.slice(1)}
                </div>
              </div>
            )}
          </div>

          {/* Connected Nodes */}
          {relatedLinks.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-text-secondary mb-2">
                Supply Chain Connections
              </div>
              <div className="space-y-1">
                {relatedLinks.map((link, idx) => {
                  const otherNodeId =
                    link.from === selectedNode ? link.to : link.from;
                  const otherNode = nodes.find(n => n.id === otherNodeId);
                  const direction = link.from === selectedNode ? '→' : '←';

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-text-primary bg-background-secondary rounded p-2"
                    >
                      <span className="text-text-tertiary">{direction}</span>
                      <span>{otherNode?.name}</span>
                      <span className="text-text-tertiary">·</span>
                      <span className="text-text-secondary">{link.label}</span>
                      {link.bottleneck && (
                        <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                          Bottleneck
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-border-secondary rounded"></div>
          <span>Normal Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Bottleneck</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-orange-400" />
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
}

// Example: HBM Supply Chain Data
export const HBM_SUPPLY_CHAIN: {
  nodes: SupplyChainNode[];
  links: SupplyChainLink[];
} = {
  nodes: [
    {
      id: 'asml',
      name: 'ASML',
      type: 'equipment',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      details: {
        role: 'EUV Lithography Equipment',
        marketShare: '100% (Monopoly)',
        leadTime: '18-24 months',
        risk: 'critical',
      },
      position: { x: 50, y: 50 },
    },
    {
      id: 'sk-hynix',
      name: 'SK Hynix',
      type: 'manufacturer',
      icon: <Factory className="w-4 h-4 text-blue-400" />,
      details: {
        role: 'HBM3E Manufacturer',
        marketShare: '95%',
        leadTime: '4-6 months',
        cost: '$1,500/unit',
        risk: 'high',
      },
      position: { x: 320, y: 50 },
    },
    {
      id: 'hbm3e',
      name: 'HBM3E Memory',
      type: 'component',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      details: {
        role: 'High Bandwidth Memory',
        marketShare: 'N/A',
        leadTime: '3-4 months',
        cost: '$1,500',
        risk: 'critical',
      },
      position: { x: 590, y: 50 },
    },
    {
      id: 'tsmc',
      name: 'TSMC',
      type: 'manufacturer',
      icon: <Factory className="w-4 h-4 text-blue-400" />,
      details: {
        role: 'GPU Die Foundry',
        marketShare: '100% (NVIDIA)',
        leadTime: '3-5 months',
        risk: 'high',
      },
      position: { x: 590, y: 180 },
    },
    {
      id: 'h100',
      name: 'NVIDIA H100',
      type: 'product',
      icon: <Package className="w-4 h-4 text-green-400" />,
      details: {
        role: 'AI Accelerator',
        marketShare: '80%+ AI Training',
        leadTime: '2-3 months',
        cost: '$30,000-$40,000',
        risk: 'medium',
      },
      position: { x: 860, y: 115 },
    },
    {
      id: 'hyperscalers',
      name: 'Hyperscalers',
      type: 'customer',
      icon: <TrendingUp className="w-4 h-4 text-orange-400" />,
      details: {
        role: 'Cloud Providers',
        marketShare: 'N/A',
        cost: '$8B-$20B/year',
        risk: 'low',
      },
      position: { x: 1130, y: 115 },
    },
  ],
  links: [
    {
      from: 'asml',
      to: 'sk-hynix',
      label: 'EUV Equipment',
      strength: 1,
      bottleneck: true,
    },
    {
      from: 'sk-hynix',
      to: 'hbm3e',
      label: 'Manufacturing',
      strength: 1,
      bottleneck: true,
    },
    {
      from: 'asml',
      to: 'tsmc',
      label: 'EUV Equipment',
      strength: 1,
      bottleneck: false,
    },
    {
      from: 'tsmc',
      to: 'h100',
      label: 'GPU Die + CoWoS',
      strength: 0.9,
      bottleneck: false,
    },
    {
      from: 'hbm3e',
      to: 'h100',
      label: 'Memory Integration',
      strength: 1,
      bottleneck: true,
    },
    {
      from: 'h100',
      to: 'hyperscalers',
      label: '$30K-$40K/unit',
      strength: 0.8,
      bottleneck: false,
    },
  ],
};
