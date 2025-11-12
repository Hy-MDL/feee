# SimLab Architecture - Quick Reference Guide

## File Quick Lookup

| Purpose | File Location | Lines | Status |
|---------|---------------|-------|--------|
| **Main Simulation Page** | `src/app/(dashboard)/simulation/page.tsx` | 1,291 | ⚠️ Monolithic - needs refactoring |
| **9-Level Controls Definition** | `src/data/levelSpecificControls.ts` | 546 | ✓ Well-structured |
| **Macro Variables (87)** | `src/data/macroVariables.ts` | ~500 | ✓ Comprehensive |
| **Macro Store** | `src/lib/store/macroStore.ts` | ~200 | ✓ Working |
| **Level Store** | `src/lib/store/levelStore.ts` | ~100 | ✓ Working |
| **Economic Flows** | `src/lib/utils/economicFlows.ts` | ~400 | ✓ Complete |
| **Date Simulation** | `src/lib/utils/dateBasedSimulation.ts` | ~500 | ✓ Complete |
| **Level Impact Calc** | `src/lib/utils/levelImpactCalculation.ts` | ~400 | ✓ Working |
| **Supply Chain Props** | `src/lib/utils/supplyChainPropagation.ts` | ~300 | ✓ Complete |
| **Scenario Management** | `src/data/supplyChainScenarios.ts` | ~300 | ✓ Working |

## Component Quick Lookup

### Simulation Components (Ready to Use)
| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| LevelControlPanel | `simulation/LevelControlPanel.tsx` | 9-level UI controls | ✓ Working |
| EconomicFlowDashboard | `simulation/EconomicFlowDashboard.tsx` | Flow visualization | ✓ Working |
| DateSimulator | `simulation/DateSimulator.tsx` | Timeline playback | ✓ Working |
| SimulationTimeline | `simulation/SimulationTimeline.tsx` | Timeline UI | ✓ Working |
| CascadeEffects | `simulation/CascadeEffects.tsx` | Propagation animation | ✓ Working |
| HedgeFundSimulator | `simulation/HedgeFundSimulator.tsx` | Portfolio optimization | ✓ Working |

### Visualization Components
| Component | File | Technology | Status |
|-----------|------|-----------|--------|
| Globe3D | `visualization/Globe3D.tsx` | react-globe.gl + Three.js | ✓ Working (50KB) |
| ForceNetworkGraph3D | `visualization/ForceNetworkGraph3D.tsx` | react-force-graph-3d | ✓ Working (37KB) |
| SupplyChainDiagram | `visualization/SupplyChainDiagram.tsx` | Canvas-based | ✓ Working |
| SupplyChainDetailPanel | `visualization/SupplyChainDetailPanel.tsx` | Detail view | ✓ Working |
| NetworkGraph3D | `visualization/NetworkGraph3D.tsx` | Alternative view | ⚠️ Not used |
| CircuitDiagram | `visualization/CircuitDiagram.tsx` | Macro circuit | ⚠️ Duplicate |

## Data Structure Reference

### 9-Level Framework
```
Level 0: Cross-level/Trade & Logistics
  ├─ Container rates
  ├─ Tariffs  
  └─ Energy costs

Level 1: Macro Variables (87 total)
  ├─ Interest rates (Fed, ECB, BOJ, BOK, PBOC)
  ├─ Yields (2Y, 10Y, curve)
  ├─ Economic indicators (GDP, PMI, employment)
  ├─ Money supply (M0, M1, M2, M3)
  ├─ Commodities (Oil, metals, ag)
  ├─ FX rates
  └─ Market sentiment (VIX, credit spreads)

Level 2: Sector Indicators
  ├─ Semiconductor CapEx Index
  ├─ Banking Credit Spread
  └─ Real Estate Vacancy

Level 3: Company Metrics
  ├─ NVIDIA GPU share
  ├─ TSMC fab utilization
  └─ SK Hynix HBM share

Level 4: Product Demand
  ├─ GPU demand index
  ├─ Smartphone demand
  └─ Cloud growth

Level 5: Component Supply
  ├─ HBM3E supply
  ├─ DRAM prices
  ├─ CoWoS capacity
  └─ EUV shipments

Level 6: Technology Innovation
  ├─ AI investment
  ├─ Process node advancement
  └─ CUDA ecosystem

Level 7: Ownership Dynamics
  ├─ Institutional ownership
  └─ Insider buying

Level 8: Customer Behavior
  ├─ Hyperscaler CapEx
  ├─ Enterprise AI adoption
  └─ Consumer spending

Level 9: Facility Operations
  ├─ Fab utilization
  └─ Data center construction
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SimulationPage (1,291 lines)              │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼──────┐     ┌──────▼──────┐     ┌─────▼──────┐
    │ MacroStore │     │ LevelStore  │     │ScenarioStore│
    │ (87 vars)  │     │(9 levels)   │     │(localStorage)│
    └────┬──────┘     └──────┬──────┘     └─────┬──────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
         ┌──────▼─────────┐      ┌────────▼─────────┐
         │ Macro Change   │      │ Level Change     │
         │  (slider move) │      │  (slider move)   │
         └──────┬─────────┘      └────────┬─────────┘
                │                        │
         ┌──────▼──────────┐      ┌──────▼────────────────┐
         │Calculate        │      │getAffectedEntities()  │
         │ Sector Impacts  │      │Calculate entity       │
         │ (linkage matrix)│      │impact scores          │
         └──────┬──────────┘      └──────┬────────────────┘
                │                        │
         ┌──────▼──────────┐      ┌──────▼────────────────┐
         │Update           │      │Update entityImpacts   │
         │calculatedImpacts│      │ Map                   │
         └──────┬──────────┘      └──────┬────────────────┘
                │                        │
         ┌──────▼──────────┐      ┌──────▼────────────────┐
         │Globe3D re-render│      │CascadeEffects animate │
         │EconomicFlowDash │      │ForceNetworkGraph redr │
         └────────────────┘      └──────┬────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │User sees ripple of │
                              │effect propagation  │
                              └────────────────────┘
```

## Performance Notes

| Component | Load Size | Render Time | Notes |
|-----------|-----------|-------------|-------|
| Globe3D | 50KB | ~100-200ms | Dynamic import (SSR: false) |
| ForceNetworkGraph3D | 37KB | ~150-300ms | Dynamic import (SSR: false) |
| LevelControlPanel | 5KB | ~10ms | Well-optimized |
| EconomicFlowDashboard | 8KB | ~20ms | Fast calculations |
| Main Page (full) | ~300KB | ~500-800ms | Initial load |

## Common Tasks

### Add a New Macro Variable
1. Edit `src/data/macroVariables.ts`
2. Add to MACRO_VARIABLES array with proper structure
3. Add to default macro state in getDefaultMacroState()
4. Update linkage matrix in `macroSectorLinkages.ts` if needed

### Add a New Level Control
1. Edit `src/data/levelSpecificControls.ts`
2. Add to appropriate LEVEL_CONTROLS constant
3. Define impactFormula if creating impact rule
4. Add to ALL_ONTOLOGY_LEVELS array

### Add a New Supply Chain Scenario
1. Edit `src/data/supplyChainScenarios.ts`
2. Add scenario with nodes, links, and conditions
3. Implement voting logic if community-driven
4. Test with scenario voting system

### Create New Visualization View
1. Create component in `src/components/visualization/`
2. Accept props: `selectedSector`, `snapshot`, `economicFlows`
3. Add view mode button in SimulationPage
4. Wire view mode selector to conditionally render

## Known Issues & Workarounds

| Issue | Location | Workaround |
|-------|----------|-----------|
| Element Library non-functional | simulation/page.tsx | Marked "Coming Soon" - feature incomplete |
| Duplicate components | `/core/` and `/layout/` | Use `/layout/` versions; consolidate later |
| Simulation page too large | page.tsx (1,291 lines) | Plan refactoring into sub-components |
| No error handling | Calculation utilities | Add try-catch wrappers |
| No validation | Save scenario dialog | Check for empty names before saving |
| Slow on low-end devices | Globe3D + ForceNetworkGraph | Consider reducing flow/node count |

## Testing Checklist

- [ ] Macro variable change → impacts update correctly
- [ ] Level control change → entities affected shown
- [ ] Date simulator → snapshots generated and playable
- [ ] Scenario save → localStorage updated
- [ ] Scenario load → correct state restored
- [ ] View mode switch → visualization changes
- [ ] Supply chain scenario → voting system works
- [ ] Economic flow → flow network calculated
- [ ] Hedge fund → portfolio optimization runs
- [ ] Cascade effects → animation plays

## Most Important Files (in order)

1. **simulation/page.tsx** - Main entry point (NEEDS REFACTORING)
2. **macroStore.ts** - State management for variables
3. **levelStore.ts** - State management for controls
4. **levelSpecificControls.ts** - 9-level definitions
5. **macroVariables.ts** - Variable definitions
6. **economicFlows.ts** - Flow calculations
7. **dateBasedSimulation.ts** - Simulation engine
8. **Globe3D.tsx** - Main visualization
9. **supplyChainScenarios.ts** - Scenario data
10. **levelImpactCalculation.ts** - Impact formulas

---

**Last Updated**: 2025-11-12
**Report Location**: `/home/user/feee/SIMLAB_ARCHITECTURE_ANALYSIS.md`
