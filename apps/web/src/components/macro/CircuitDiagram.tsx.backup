'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMacroStore } from '@/lib/store/macroStore';

interface CircuitNode {
  id: string;
  label: string;
  level: 'macro' | 'sector' | 'company';
  x: number;
  y: number;
  color: string;
  impact?: number;
}

interface CircuitConnection {
  from: string;
  to: string;
  strength: number;
}

const LEVEL_COLORS = {
  macro: '#FFD700',
  sector: '#00E5FF',
  company: '#00FF9F',
};

const CIRCUIT_NODES: CircuitNode[] = [
  // Macro level
  { id: 'fed_rate', label: 'Fed Rate', level: 'macro', x: 50, y: 50, color: LEVEL_COLORS.macro },
  { id: 'gdp', label: 'GDP Growth', level: 'macro', x: 50, y: 150, color: LEVEL_COLORS.macro },

  // Sector level
  { id: 'banking', label: 'Banking', level: 'sector', x: 300, y: 30, color: '#06B6D4' },
  { id: 'realestate', label: 'Real Estate', level: 'sector', x: 300, y: 90, color: '#00FF9F' },
  { id: 'manufacturing', label: 'Manufacturing', level: 'sector', x: 300, y: 150, color: '#8B5CF6' },
  { id: 'semiconductor', label: 'Semiconductor', level: 'sector', x: 300, y: 210, color: '#F59E0B' },

  // Company level (sample)
  { id: 'kb', label: 'KB Bank', level: 'company', x: 550, y: 20, color: '#06B6D4' },
  { id: 'shinhan', label: 'Shinhan', level: 'company', x: 550, y: 50, color: '#06B6D4' },
  { id: 'samsung_c', label: 'Samsung C&T', level: 'company', x: 550, y: 90, color: '#00FF9F' },
  { id: 'posco', label: 'POSCO', level: 'company', x: 550, y: 140, color: '#8B5CF6' },
  { id: 'hyundai_steel', label: 'Hyundai Steel', level: 'company', x: 550, y: 170, color: '#8B5CF6' },
  { id: 'samsung', label: 'Samsung Elec', level: 'company', x: 550, y: 200, color: '#F59E0B' },
  { id: 'sk_hynix', label: 'SK Hynix', level: 'company', x: 550, y: 230, color: '#F59E0B' },
];

const CIRCUIT_CONNECTIONS: CircuitConnection[] = [
  // Macro → Sector
  { from: 'fed_rate', to: 'banking', strength: 0.8 },
  { from: 'fed_rate', to: 'realestate', strength: -0.7 },
  { from: 'gdp', to: 'manufacturing', strength: 0.6 },
  { from: 'gdp', to: 'semiconductor', strength: 0.7 },

  // Sector → Company
  { from: 'banking', to: 'kb', strength: 0.9 },
  { from: 'banking', to: 'shinhan', strength: 0.9 },
  { from: 'realestate', to: 'samsung_c', strength: 0.8 },
  { from: 'manufacturing', to: 'posco', strength: 0.85 },
  { from: 'manufacturing', to: 'hyundai_steel', strength: 0.8 },
  { from: 'semiconductor', to: 'samsung', strength: 0.95 },
  { from: 'semiconductor', to: 'sk_hynix', strength: 0.9 },
];

export default function CircuitDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const macroState = useMacroStore(state => state.macroState);
  const calculatedImpacts = useMacroStore(state => state.calculatedImpacts);
  const [animating, setAnimating] = useState(false);
  const prevFedRate = useRef(macroState.fed_funds_rate);

  // Trigger cascade animation when Fed Rate changes
  useEffect(() => {
    if (prevFedRate.current !== macroState.fed_funds_rate) {
      triggerCascadeAnimation();
      prevFedRate.current = macroState.fed_funds_rate;
    }
  }, [macroState.fed_funds_rate]);

  // Draw circuit diagram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      CIRCUIT_CONNECTIONS.forEach(conn => {
        const fromNode = CIRCUIT_NODES.find(n => n.id === conn.from);
        const toNode = CIRCUIT_NODES.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        ctx.beginPath();
        ctx.moveTo(fromNode.x + 40, fromNode.y + 15);
        ctx.lineTo(toNode.x, toNode.y + 15);

        const isPositive = conn.strength > 0;
        ctx.strokeStyle = isPositive ? 'rgba(0, 255, 159, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = Math.abs(conn.strength) * 3;
        ctx.stroke();
      });

      // Draw nodes
      CIRCUIT_NODES.forEach(node => {
        // Node background
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(node.x, node.y, node.level === 'macro' ? 80 : 120, 30);

        // Node border
        ctx.globalAlpha = 1;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(node.x, node.y, node.level === 'macro' ? 80 : 120, 30);

        // Node label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = node.level === 'macro' ? 'bold 11px monospace' : '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x + (node.level === 'macro' ? 40 : 60), node.y + 15);
      });
    };

    draw();
  }, []);

  const triggerCascadeAnimation = () => {
    if (animating) return;
    setAnimating(true);

    // Get all pulse elements
    const macroElements = document.querySelectorAll('.circuit-pulse-macro');
    const sectorElements = document.querySelectorAll('.circuit-pulse-sector');
    const companyElements = document.querySelectorAll('.circuit-pulse-company');
    const signalElements = document.querySelectorAll('.circuit-signal');

    // Animate macro nodes first
    macroElements.forEach(el => {
      el.classList.add('animate-pulse-scale');
    });

    setTimeout(() => {
      macroElements.forEach(el => el.classList.remove('animate-pulse-scale'));

      // Animate sector nodes
      sectorElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate-pulse-scale');
          setTimeout(() => el.classList.remove('animate-pulse-scale'), 500);
        }, index * 100);
      });
    }, 600);

    setTimeout(() => {
      // Animate company nodes
      companyElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate-pulse-scale');
          setTimeout(() => el.classList.remove('animate-pulse-scale'), 400);
        }, index * 80);
      });
    }, 1100);

    // Animate signal particles
    signalElements.forEach((el, index) => {
      setTimeout(() => {
        (el as HTMLElement).style.animation = 'signalFlow 1s ease-in-out forwards';
      }, index * 100);
    });

    setTimeout(() => {
      setAnimating(false);
      // Reset signal animations
      signalElements.forEach(el => {
        (el as HTMLElement).style.animation = '';
      });
    }, 2500);
  };

  return (
    <>
      <style>{`
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes signalFlow {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(250px); opacity: 0; }
        }
        .animate-pulse-scale {
          animation: pulseScale 0.6s ease-out;
        }
      `}</style>

      <div className="relative w-full h-full bg-black rounded-lg border border-border-primary p-4 overflow-hidden" ref={containerRef}>
        {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-semibold text-accent-cyan mb-1">Circuit Diagram</h3>
        <p className="text-xs text-text-tertiary">Macro → Sector → Company Impact Flow</p>
      </div>

      {/* Impact Indicators */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-2">
          <div className="text-xs text-text-tertiary mb-1">Banking</div>
          <div className={`text-lg font-bold ${calculatedImpacts.banking >= 0 ? 'text-status-safe' : 'text-status-danger'}`}>
            {calculatedImpacts.banking >= 0 ? '+' : ''}{calculatedImpacts.banking.toFixed(1)}%
          </div>
        </div>
        <div className="bg-black/80 backdrop-blur border border-border-primary rounded-lg p-2">
          <div className="text-xs text-text-tertiary mb-1">Real Estate</div>
          <div className={`text-lg font-bold ${calculatedImpacts.realEstate >= 0 ? 'text-status-safe' : 'text-status-danger'}`}>
            {calculatedImpacts.realEstate >= 0 ? '+' : ''}{calculatedImpacts.realEstate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* Pulse overlays for animation */}
      <div className="absolute inset-0 pointer-events-none">
        {CIRCUIT_NODES.map(node => (
          <div
            key={node.id}
            className={`circuit-pulse-${node.level} absolute rounded`}
            style={{
              left: `${node.x}px`,
              top: `${node.y + 50}px`,
              width: node.level === 'macro' ? '80px' : '120px',
              height: '30px',
              backgroundColor: node.color,
              opacity: 0.2,
              boxShadow: `0 0 20px ${node.color}`,
            }}
          />
        ))}

        {/* Signal particles */}
        {CIRCUIT_CONNECTIONS.map((conn, index) => {
          const fromNode = CIRCUIT_NODES.find(n => n.id === conn.from);
          if (!fromNode) return null;

          return (
            <div
              key={index}
              className="circuit-signal absolute"
              style={{
                left: `${fromNode.x + 40}px`,
                top: `${fromNode.y + 50 + 13}px`,
                width: '8px',
                height: '8px',
                backgroundColor: conn.strength > 0 ? '#00FF9F' : '#EF4444',
                borderRadius: '50%',
                boxShadow: `0 0 10px ${conn.strength > 0 ? '#00FF9F' : '#EF4444'}`,
                opacity: 0,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur border border-border-primary rounded-lg p-3">
        <div className="text-xs text-text-tertiary mb-2 font-semibold">Signal Flow</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px #00FF9F' }} />
            <span className="text-text-primary">Positive Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" style={{ boxShadow: '0 0 8px #EF4444' }} />
            <span className="text-text-primary">Negative Impact</span>
          </div>
        </div>
      </div>

      {/* Animating indicator */}
      {animating && (
        <div className="absolute bottom-4 right-4 z-10 bg-accent-cyan/20 border border-accent-cyan rounded-lg px-3 py-2">
          <div className="text-xs text-accent-cyan font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            Cascade Animating...
          </div>
        </div>
      )}
      </div>
    </>
  );
}
