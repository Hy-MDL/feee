# SimLab Architecture - Comprehensive Analysis Report

## 1. OVERALL CODEBASE STRUCTURE

### Directory Layout
```
/home/user/feee/apps/web/src/
├── app/                                    # Next.js 14 App Router
│   ├── (dashboard)/                       # Dashboard route group
│   │   ├── simulation/page.tsx            # Main SimLab page (1,291 lines)
│   │   ├── dashboard/page.tsx             # General dashboard
│   │   ├── ceo-dashboard/page.tsx         # Admin dashboard
│   │   ├── community/page.tsx             # Community features
│   │   ├── reports/page.tsx               # Reports
│   │   └── filings/page.tsx               # Filings
│   ├── api/                               # API routes
│   ├── arena/page.tsx                     # Arena/competition page
│   ├── ontology/page.tsx                  # Ontology visualization
│   ├── trading/page.tsx                   # Trading interface
│   └── layout.tsx                         # Root layout
│
├── components/                            # React components (59 files)
│   ├── simulation/                        # Core simulation components
│   │   ├── LevelControlPanel.tsx          # 9-level controls interface
│   │   ├── EconomicFlowDashboard.tsx      # Economic flow visualization
│   │   ├── DateSimulator.tsx              # Date-based simulation
│   │   ├── SimulationTimeline.tsx         # Timeline visualization
│   │   ├── CascadeEffects.tsx             # Cascade propagation effects
│   │   └── HedgeFundSimulator.tsx         # Hedge fund strategies
│   │
│   ├── visualization/                     # 3D/2D visualizations
│   │   ├── Globe3D.tsx                    # 3D globe with economic flows
│   │   ├── ForceNetworkGraph3D.tsx        # 3D network graph
│   │   ├── SupplyChainDiagram.tsx         # Supply chain visualization
│   │   ├── SupplyChainDetailPanel.tsx     # Supply chain details
│   │   ├── CircuitDiagram.tsx             # Circuit diagram visualization
│   │   └── NetworkGraph3D.tsx             # Alternative network view
│   │
│   ├── layout/                            # Navigation & layout
│   │   ├── GlobalTopNav.tsx               # Top navigation bar
│   │   ├── Sidebar.tsx                    # Left sidebar
│   │   ├── Header.tsx                     # Header component
│   │   └── MobileNavbar.tsx               # Mobile navbar (unused)
│   │
│   ├── ui/                                # Design system components
│   │   ├── DesignSystem.tsx               # Unified design exports
│   │   ├── Card.tsx                       # Card component
│   │   ├── Button.tsx                     # Button component
│   │   ├── Badge.tsx                      # Badge component
│   │   ├── ProgressBar.tsx                # Progress bar
│   │   ├── Slider.tsx                     # Slider control
│   │   ├── InteractiveCard.tsx            # Interactive cards
│   │   └── index.ts                       # Exports
│   │
│   ├── platform/                          # Platform features
│   │   ├── PlatformDashboard.tsx          # Platform dashboard
│   │   ├── TempDashboard.tsx              # Temporary dashboard (unused?)
│   │   ├── CommunityPanel.tsx             # Community panel
│   │   ├── NewsFeed.tsx                   # News feed
│   │   └── HorizontalCalendar.tsx         # Calendar widget
│   │
│   ├── macro/                             # Macro controls
│   │   ├── MacroControlPanel.tsx          # Macro variable controls
│   │   └── CircuitDiagram.tsx             # Macro circuit diagram
│   │
│   ├── finance/                           # Finance components
│   │   ├── KeyTickers.tsx                 # Stock tickers
│   │   ├── Watchlist.tsx                  # Watchlist
│   │   ├── Movers.tsx                     # Market movers
│   │   ├── PriceHistoryChart.tsx          # Price charts
│   │   ├── LivePriceIndicator.tsx         # Live prices
│   │   └── PriceAlertModal.tsx            # Price alerts
│   │
│   ├── reports/                           # Report components
│   │   ├── ReportEditor.tsx               # Report editor
│   │   ├── ReportViewer.tsx               # Report viewer
│   │   └── ReportList.tsx                 # Report list
│   │
│   ├── community/                         # Community features
│   │   ├── MDEditor.tsx                   # Markdown editor
│   │   ├── ScenarioSection.tsx            # Scenario management
│   │   └── ReportSection.tsx              # Report section
│   │
│   ├── landing/                           # Landing page
│   │   ├── HeroSection.tsx
│   │   ├── AISection.tsx
│   │   ├── OntologySection.tsx
│   │   ├── VisualizationSection.tsx
│   │   └── CtaSection.tsx
│   │
│   ├── shared/                            # Shared utilities
│   │   ├── LoadingScreen.tsx
│   │   └── ui/                            # Shared UI components
│   │
│   ├── charts/                            # Chart components
│   │   ├── LightweightChart.tsx
│   │   └── BotComparisonChart.tsx
│   │
│   ├── news/                              # News components
│   │   └── NewsPanel.tsx
│   │
│   ├── sectors/                           # Sector-specific components
│   │   └── real-estate/                   # Real estate sector
│   │       ├── RealEstateStockChart.tsx
│   │       └── RealEstateControls.tsx
│   │
│   ├── core/                              # Core layout components
│   │   ├── SimulationLayout.tsx           # Old simulation layout (minimal use)
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── NewsFeed.tsx
│   │
│   ├── trading/                           # Trading components
│   │   └── BotComparisonChart.tsx
│   │
│   └── background/                        # Background components
│       └── StarfieldBackground.tsx
│
├── data/                                  # Data & constants
│   ├── levelSpecificControls.ts           # 9-level control definitions
│   ├── macroVariables.ts                  # 87 macro variables
│   ├── supplyChainScenarios.ts            # Supply chain scenarios
│   ├── globalSupplyChain.ts               # Global supply chain data
│   ├── companies.ts                       # Company data
│   ├── knowledgeGraph.ts                  # Knowledge graph entities
│   ├── expandedKnowledgeGraph.ts          # Extended KG
│   ├── macroSectorLinkages.ts             # Linkage matrix
│   └── macroSectorLinkages.ts
│
├── lib/                                   # Utilities & stores
│   ├── store/                             # Zustand stores
│   │   ├── macroStore.ts                  # Macro variable state
│   │   ├── levelStore.ts                  # Level control state
│   │   ├── scenarioStore.ts               # Scenario management
│   │   ├── botStore.ts                    # Trading bot state
│   │   ├── relationshipStore.ts           # Entity relationships
│   │   ├── linkageStore.ts                # Linkage state
│   │   ├── proposalStore.ts               # Proposals
│   │   └── reportStore.ts                 # Reports
│   │
│   ├── utils/                             # Utility functions
│   │   ├── economicFlows.ts               # Economic flow calculations
│   │   ├── dateBasedSimulation.ts         # Time-based simulation
│   │   ├── supplyChainPropagation.ts      # Supply chain propagation
│   │   ├── levelImpactCalculation.ts      # Level-specific impacts
│   │   ├── impactCalculation.ts           # General impact calc
│   │   ├── timelineSimulation.ts          # Timeline simulation
│   │   ├── reportGenerator.ts             # Report generation
│   │   └── formatting.ts                  # Formatting utilities
│   │
│   ├── config/                            # Configuration
│   │   ├── simulation.config.ts           # Simulation config
│   │   ├── sectors.config.ts              # Sector colors/configs
│   │   ├── routes.config.ts               # Route definitions
│   │   ├── features.config.ts             # Feature flags
│   │   ├── api.config.ts                  # API configuration
│   │   └── colors.config.ts               # Color theme
│   │
│   ├── api/                               # API utilities
│   │   └── yahoo-finance.ts               # Yahoo Finance API
│   │
│   └── types/                             # TypeScript types
│       └── common.ts                      # Common types
│
└── styles/                                # Global styles
    └── globals.css
```

---

## 2. SIMLAB-RELATED FILES & COMPONENTS

### Key Simulation Files (Found)
- `/home/user/feee/apps/web/src/app/(dashboard)/simulation/page.tsx` - Main SimLab page (1,291 lines) - MONOLITHIC COMPONENT
- `/home/user/feee/apps/web/src/data/levelSpecificControls.ts` - 9-level control definitions (546 lines)
- `/home/user/feee/apps/web/src/data/supplyChainScenarios.ts` - Supply chain scenarios & voting
- `/home/user/feee/apps/web/src/lib/store/levelStore.ts` - Level control state management
- `/home/user/feee/apps/web/src/lib/utils/levelImpactCalculation.ts` - Impact formula calculations
- `/home/user/feee/apps/web/src/lib/utils/supplyChainPropagation.ts` - Supply chain dynamics
- `/home/user/feee/apps/web/src/lib/utils/dateBasedSimulation.ts` - Date-based simulation engine
- `/home/user/feee/apps/web/src/lib/utils/economicFlows.ts` - Economic flow network calculations

### 9-Level Factor Controls (Defined in levelSpecificControls.ts)
```
Level 0: Cross-level/Trade & Logistics
- Container rates, Tariffs, Energy costs

Level 1: Macro Variables (separate - handled in macroStore)
- Fed rates, Yields, GDP growth, M2, Oil, VIX

Level 2: Sector Indicators
- Semiconductor CapEx, Banking credit spread, Real estate vacancy

Level 3: Company Metrics
- NVIDIA AI GPU share, TSMC fab utilization, SK Hynix HBM share

Level 4: Product Demand
- GPU demand index, Smartphone demand, Cloud growth

Level 5: Component Supply
- HBM3E supply, DRAM prices, CoWoS capacity, EUV shipments

Level 6: Technology Innovation
- AI investment, Process node advancement, CUDA ecosystem

Level 7: Ownership Dynamics
- Institutional ownership, Insider buying activity

Level 8: Customer Behavior
- Hyperscaler CapEx, Enterprise AI adoption, Consumer spending

Level 9: Facility Operations
- Fab utilization, Data center construction
```

---

## 3. KEY REACT COMPONENTS FOR SIMULATION

### Main Simulation Page Component
- **Location**: `/home/user/feee/apps/web/src/app/(dashboard)/simulation/page.tsx`
- **Size**: 1,291 lines (EXTREMELY LARGE - architectural issue)
- **Status**: Monolithic - contains too much logic
- **Key Features**:
  - Macro variable controls (6 main controls + 87 total)
  - 9-level ontology control panel
  - Supply chain scenario management
  - Date-based simulation playback
  - Multiple view modes (split/globe/network/supply-chain/economic-flow/hedge-fund)
  - Save/load scenario dialogs
  - Supply chain diagram visualization
  - Economic flow tracking

### Child Components Used in Simulation
1. **LevelControlPanel** - Displays expandable 9-level controls with sliders
2. **EconomicFlowDashboard** - Shows money flow network and statistics
3. **DateSimulator** - Date picker and playback controls
4. **SimulationTimeline** - Timeline visualization
5. **CascadeEffects** - Animates propagation through knowledge graph
6. **HedgeFundSimulator** - Portfolio optimization strategies
7. **Globe3D** (dynamic) - 3D globe with economic flows and company nodes
8. **ForceNetworkGraph3D** (dynamic) - Force-directed network visualization
9. **SupplyChainDiagram** - Supply chain visualization with detail panel

---

## 4. LAYOUT & NAVIGATION STRUCTURE

### Top Navigation (GlobalTopNav.tsx)
```
Home | Sim Lab | Ontology | Reports | Arena | Learn | Community | Admin
```
- Sticky top navigation
- Responsive (icons on mobile, full text on desktop)
- Active state highlighting
- Grouped by category: Core, Visualization, Platform, Social, Admin

### Layout Hierarchy
```
<RootLayout>                           // app/layout.tsx
  <body>
    <GlobalTopNav />                   // Top navigation
    <DashboardLayout>                  // app/(dashboard)/layout.tsx
      <SimulationPage />               // Main page
        <Header /> (core)              // Breadcrumbs & context
        <Sidebar /> (core)             // Left sidebar navigation
        <div className="flex-1">
          <!-- Main content area -->
          <!-- Multiple view modes (split/globe/network/etc) -->
        </div>
        <div className="w-80">         <!-- Right sidebar -->
          <!-- Element library -->
          <!-- Scenario management -->
          <!-- Supply chain scenarios -->
        </div>
        <NewsFeed />                   // Bottom news feed
```

### Navigation to SimLab
- Direct URL: `/simulation` or `/dashboard/simulation`
- From top nav: Click "Sim Lab" button
- Responsive on mobile (hidden on small screens)

---

## 5. DATA FLOW & SIMULATION MECHANICS

### State Management (Zustand Stores)

#### MacroStore (macroStore.ts)
- **State**: 87 macro variables
- **Variables**: Fed rate, Treasury yields, GDP, M2, Oil, VIX, Commodities, FX, etc.
- **Triggers**: `updateMacroVariable(id, value)`
- **Calculations**: Immediately recalculates sector impacts
- **Output**: `calculatedImpacts` object with 5 sector impacts

#### LevelStore (levelStore.ts)
- **State**: 9-level control values
- **Variables**: 30+ controls across levels 0-9
- **Triggers**: `updateLevelControl(level, controlId, value)`
- **Output**: `entityImpacts` Map with entity-level effects

#### ScenarioStore (scenarioStore.ts)
- **State**: Saved scenarios (localStorage)
- **Methods**: `saveScenario()`, `loadScenario()`, `deleteScenario()`
- **Data**: Macro state + level state snapshots

### Data Flow for Simulations

#### Path 1: Macro Variable Change
```
User adjusts macro slider
  ↓
updateMacroVariable(id, value) called
  ↓
calculateSectorImpacts() executes
  ↓
Impacts calculated using linkage matrix (macroSectorLinkages.ts)
  ↓
macroState updated, calculatedImpacts recalculated
  ↓
Components re-render (Globe3D, ForceNetworkGraph3D, EconomicFlowDashboard)
```

#### Path 2: Level Control Change
```
User adjusts level control slider
  ↓
handleLevelChange(level, controlId, value)
  ↓
levelState updated
  ↓
getAffectedEntities() calculates which entities are impacted
  ↓
entityImpacts Map updated
  ↓
CascadeEffects animates the propagation
  ↓
Components re-render
```

#### Path 3: Date-Based Simulation
```
User sets start/end dates and clicks "Run Simulation"
  ↓
runDateBasedSimulation() called from DateSimulator
  ↓
Creates snapshots for each interval (30 days default)
  ↓
For each snapshot:
  - Interpolates macro variables over time
  - Applies growth/volatility
  - Calculates entity values
  - Stores EntitySnapshot in snapshots array
  ↓
snapshots array triggers re-renders of Globe3D/ForceNetworkGraph3D
  ↓
Animation loop plays back snapshots (speed-controlled)
```

### Calculation Engines

#### 1. Impact Calculation (impactCalculation.ts)
```typescript
calculateAllImpacts(macroState, linkages)
  → Returns sector impacts for: BANKING, REALESTATE, MANUFACTURING, SEMICONDUCTOR, CRYPTO
  → Uses: macroSectorLinkages.ts matrix
  → Formula: Impact = Sum(macroVariable × linkageStrength)
```

#### 2. Level-Specific Impact (levelImpactCalculation.ts)
```typescript
getAffectedEntities(controlId, entityImpacts)
  → Finds all entities affected by a control
  → Uses: knowledgeGraph.ts entity definitions
  → Returns: Sorted list of impacts
  
getImpactColor(impactScore) → Color gradient
getImpactSizeMultiplier(impactScore) → Size scaling
```

#### 3. Supply Chain Propagation (supplyChainPropagation.ts)
```typescript
- Tracks material flow through supply chain
- Models bottlenecks (HBM3E supply < 80 = production constraint)
- Calculates downstream impacts
```

#### 4. Economic Flows (economicFlows.ts)
```typescript
calculateEconomicFlows(currentMacro, previousMacro, levelState)
  → Identifies changes in macro/level state
  → Creates flow objects: {from, to, type, magnitude, impact}
  → Flow types: monetary, credit, policy, investment, trade
  → Builds flow network for visualization

calculateMoneyVelocity(gdp, m2)
calculateCreditMultiplier(reserveRatio)
```

#### 5. Date-Based Simulation (dateBasedSimulation.ts)
```typescript
runDateBasedSimulation(macroState, levelState, config)
  → Creates DateSnapshot for each interval
  → Each snapshot includes:
    - date
    - macroState (interpolated)
    - levelState
    - entitySnapshots with calculated values
  → Returns array of snapshots for timeline playback
```

---

## 6. VISUALIZATION COMPONENTS ANALYSIS

### Globe3D (Globe3D.tsx - 50KB)
- **Technology**: react-globe.gl + Three.js
- **What it shows**:
  - Countries with M2 money supply (bubble size)
  - Trade flows as arcs between countries
  - Economic flows from current macro state
  - Shipping routes (sea/air)
  - Supply chain paths
  - Real-time arc animations
- **Data source**: 
  - COUNTRIES array (10 major economies)
  - COMPREHENSIVE_FLOWS array (200+ flows)
  - Input: `currentSnapshot` from date simulator
  - Input: `economicFlows` from macro changes
- **Interactivity**: 
  - Click countries to select sector
  - View modes: companies/flows/m2
- **Issues**: ✓ Working, but LARGE file

### ForceNetworkGraph3D (ForceNetworkGraph3D.tsx - 37KB)
- **Technology**: react-force-graph-3d + Three.js
- **What it shows**:
  - Node-link diagram of entities
  - Colored by sector
  - Size by market impact
  - Links show relationships
  - Real-time force simulation
- **Data source**: 
  - Companies from companies.ts
  - Linkages from calculated impacts
  - Input: `selectedSector` to filter
  - Input: `snapshot` for entity values
- **Issues**: ✓ Working, but LARGE file

### SupplyChainDiagram (SupplyChainDiagram.tsx - 15KB)
- **Technology**: React Canvas-based rendering
- **What it shows**:
  - Supply chain hierarchy (TSMC → NVIDIA → Hyperscalers)
  - HBM_SUPPLY_CHAIN constant with nodes/links
  - Component availability constraints
  - Color-coded supply status
- **Data source**: HBM_SUPPLY_CHAIN constant + scenarios
- **Issues**: ✓ Working well

---

## 7. UNUSED & UNDERUTILIZED COMPONENTS

### Potentially Unused Components (Not found in imports)
1. **MobileNavbar.tsx** - May be unused (TopNav handles both mobile/desktop)
2. **TempDashboard.tsx** - Likely placeholder/deprecated
3. **NetworkGraph3D.tsx** - Alternative network view (not used in simulation)
4. **MacroControlPanel.tsx** - Separate macro controls (functionality in main page)
5. **CircuitDiagram.tsx** (in macro/) - May be unused

### Underutilized Components
1. **SimulationLayout.tsx** (in core/) - Old layout component
   - Status: Has custom Header/Sidebar/NewsFeed trio
   - Issue: Not being used; main page uses inline layout
   - Should replace: Current inline layout in simulation/page.tsx

2. **HorizontalCalendar.tsx** - Not visible in main simulation
   - Status: Defined but may not be rendered

3. **NewsPanel.tsx** vs **NewsFeed.tsx**
   - Status: Two similar components; consolidation needed

### Duplicate Components
1. **Sidebar.tsx** appears in TWO places:
   - `/components/core/Sidebar.tsx`
   - `/components/layout/Sidebar.tsx`
   - Issue: Likely redundant; need to consolidate

2. **Header.tsx** appears in TWO places:
   - `/components/core/Header.tsx`
   - `/components/layout/Header.tsx`
   - Issue: Likely redundant; need to consolidate

3. **NewsFeed.tsx** appears in TWO places:
   - `/components/core/NewsFeed.tsx`
   - `/components/platform/NewsFeed.tsx`
   - Issue: Likely redundant

4. **CircuitDiagram.tsx** appears in TWO places:
   - `/components/visualization/CircuitDiagram.tsx`
   - `/components/macro/CircuitDiagram.tsx`
   - Issue: Likely redundant

---

## 8. ARCHITECTURAL ISSUES & NON-RESPONSIVE ELEMENTS

### CRITICAL ISSUES

#### 1. Monolithic Simulation Page (1,291 lines)
**Problem**: Single file contains:
- Macro control logic
- Level control logic
- Date simulation logic
- View mode management
- Scenario save/load
- Supply chain scenario voting
- All UI rendering

**Impact**: 
- Difficult to maintain
- Hard to test individual features
- Tight coupling of concerns
- Difficult to reuse components
- Performance issues when re-rendering

**Solution**: Break into:
```
SimulationPage
├── MacroControlSection
├── LevelControlSection
├── DateSimulatorSection
├── SupplyChainScenarioSection
├── ViewModeSwitcher
├── MainVisualizationArea
│   ├── SplitView (Globe + Network)
│   ├── GlobeView
│   ├── NetworkView
│   ├── SupplyChainView
│   ├── EconomicFlowView
│   └── HedgeFundView
└── RightSidebar
    ├── ElementLibrary
    └── ScenarioPanel
```

#### 2. Duplicate Components in Multiple Locations
**Problem**: 
- Sidebar exists in both `/core/` and `/layout/`
- Header exists in both `/core/` and `/layout/`
- NewsFeed in `/core/` and `/platform/`
- CircuitDiagram in `/visualization/` and `/macro/`

**Impact**: 
- Code duplication and maintenance burden
- Inconsistent behavior
- Confusion about which to use

**Solution**: 
- Keep only `/components/layout/` versions
- Update all imports
- Delete `/components/core/` duplicates

#### 3. Non-Responsive Elements

**Element Library Sidebar**
- Status: "Coming Soon" - NOT FUNCTIONAL
- Location: Right sidebar in simulation page
- Issue: Shows placeholder; no actual drag-drop functionality

**Relationship Types & Macro Variables** (in Element Library)
- Status: Non-interactive drag-drop elements
- Issue: `cursor-move` styling but no actual drag handlers
- Impact: User confusion - looks interactive but isn't

**Save/Load Dialog**
- Status: WORKS ✓
- Functionality: Can save scenarios to localStorage
- Issue: No validation; should prevent empty names

**View Mode Switching**
- Status: WORKS ✓
- Modes: split, globe, network, supply-chain, economic-flow, hedge-fund
- Issue: May need loading indicators during transitions

#### 4. Globe3D & ForceNetworkGraph3D

**Dynamic Imports with SSR: false**
```typescript
const Globe3D = dynamic(() => import('@/components/visualization/Globe3D'), { ssr: false });
const ForceNetworkGraph3D = dynamic(() => import('@/components/visualization/ForceNetworkGraph3D'), { ssr: false });
```
- **Why**: Three.js and react-globe.gl require browser APIs
- **Issue**: Page may show loading state briefly
- **Status**: ✓ Correct approach

**Potential Issues**:
- Large file sizes (50KB + 37KB = 87KB for viz)
- May cause slow initial load
- Animation performance depends on device

#### 5. Date Simulator Timeline

**Issues**:
- Playback speed control exists but may not be smooth
- Animation frame throttling needed for 60fps
- Large number of snapshots (100+) may cause lag

---

## 9. CURRENT DESIGN PATTERNS

### State Management Pattern (Zustand)
✓ Good: Store-based reactive updates
✓ Correct: Automatic re-renders on state change
Issue: Could be more modular (stores are large)

### Component Architecture
Issue: Mix of container and presentational components
- Some components handle state + UI (anti-pattern)
- Some are pure presentational

### Styling Pattern
✓ Good: Tailwind CSS + custom classes
✓ Good: Design tokens in config files
Issue: Some hardcoded colors in components

### Data Flow
✓ Good: Unidirectional (Store → Component → Action → Store)
✓ Good: Immutable state updates
Issue: No middleware/effects management

---

## 10. WHAT'S WORKING WELL

✓ **Macro Variable System**
- 87 variables well-organized
- Real-time impact calculation
- Sector-based filtering

✓ **9-Level Control System**
- Comprehensive ontology (Levels 0-9)
- Expandable/collapsible UI
- Clear impact formulas shown

✓ **Supply Chain Visualization**
- HBM/GPU supply chain well-modeled
- Scenario voting system functional
- Detail panel shows dependencies

✓ **Economic Flow Analysis**
- Money velocity calculation ✓
- Credit multiplier ✓
- Flow network building ✓
- Inflow/outflow node statistics ✓

✓ **3D Visualizations**
- Globe3D with arc animations working
- Network graph with force simulation working
- Real-time updates connected to stores

✓ **Date-Based Simulation**
- Interpolation of variables over time working
- Playback controls functional
- Snapshot-based architecture clean

✓ **Scenario Management**
- Save to localStorage ✓
- Load scenarios ✓
- Multiple view persistence needed

✓ **Hedge Fund Simulator**
- Portfolio optimization algorithms implemented
- Stress testing included
- Options pricing (Black-Scholes) available

---

## 11. WHAT NEEDS WORK

### HIGH PRIORITY

1. **Break up simulation/page.tsx**
   - 1,291 lines is unmanageable
   - Create sub-components for each section
   - Estimated: 6-8 new components

2. **Remove Duplicate Components**
   - Consolidate Sidebar/Header/NewsFeed/CircuitDiagram
   - Keep only `/layout/` versions
   - Update imports across codebase

3. **Complete Element Library**
   - Currently shows "Coming Soon"
   - Implement actual drag-drop for relationships
   - Wire to scenario builder

4. **Fix Non-Responsive UI**
   - Element library dragging
   - Real-time validation for save dialog
   - Loading states during view transitions

5. **Performance Optimization**
   - Lazy load Globe3D/ForceNetworkGraph3D components
   - Memoize expensive calculations
   - Implement virtual scrolling for large lists

### MEDIUM PRIORITY

6. **Component Organization**
   - Move calculation logic to hooks
   - Separate concerns in components
   - Create custom hooks for complex state

7. **Testing Infrastructure**
   - Add unit tests for calculation functions
   - Add integration tests for state changes
   - Add E2E tests for simulation workflow

8. **Error Handling**
   - Add try-catch around calculations
   - User feedback for errors
   - Graceful degradation

9. **Type Safety**
   - Create strict types for all entities
   - Use discriminated unions for flow types
   - Add validation schemas

### LOWER PRIORITY

10. **Analytics**
    - Track user scenario creation
    - Monitor visualization rendering time
    - Log error rates

11. **Documentation**
    - Document 9-level framework
    - Create runbook for adding new variables
    - Record demo video of features

---

## 12. RECOMMENDED NEXT STEPS

### Phase 1: Cleanup (1-2 days)
1. Remove duplicate components
2. Update imports
3. Verify no broken links

### Phase 2: Refactor (3-5 days)
1. Extract sections from simulation/page.tsx
2. Create new sub-components
3. Create custom hooks for state logic
4. Add error boundaries

### Phase 3: Enhancement (2-3 days)
1. Implement Element Library drag-drop
2. Add loading states
3. Improve animations
4. Add tooltips/help text

### Phase 4: Testing (2-3 days)
1. Unit tests for utils
2. Integration tests for stores
3. Component tests for interactive elements

---

## Summary Statistics

- **Total Components**: 59
- **Simulation-Specific**: 15 (25%)
- **Visualization**: 6 (10%)
- **Layout/Navigation**: 7 (12%)
- **Duplicate Components**: 4 sets
- **Unused Components**: ~3-5
- **Data Files**: 8 (87 macro vars + 30+ level controls)
- **Store Files**: 8 (Zustand stores)
- **Utility Functions**: 8 files with complex calculations
- **Largest File**: simulation/page.tsx (1,291 lines)
- **Total Lines of Code**: ~15,000+ in components + ~10,000+ in libs/utils/stores

