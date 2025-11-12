# SimLab Implementation Roadmap
## Polymarket + Palantir + Obsidian 통합 플랫폼 구현 계획

---

## 🎯 Vision Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXUS-ALPHA PLATFORM                          │
│                    (Your Integrated Vision)                          │
└─────────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   POLYMARKET     │   │    OBSIDIAN      │   │    PALANTIR      │
│     LAYER        │   │      LAYER       │   │      LAYER       │
│                  │   │                  │   │                  │
│ • Scenario       │   │ • MD Reports     │   │ • Ontology       │
│   Marketplace    │   │ • [[Links]]      │   │ • Digital Twin   │
│ • Community      │   │ • Brain Map      │   │ • Data Lineage   │
│   Voting         │   │ • Knowledge      │   │ • Entity Graph   │
│ • Predictions    │   │   Graph          │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │   SIMULATION ENGINE    │
                    │                        │
                    │  • Macro Variables     │
                    │  • 9-Level Controls    │
                    │  • Impact Calculation  │
                    │  • Supply Chain        │
                    │  • Economic Flows      │
                    └────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │  VISUALIZATION    │     │   DATA SOURCES    │
        │                   │     │                   │
        │ • Globe 3D        │     │ • Real-time APIs  │
        │ • Network Graph   │     │ • Historical DB   │
        │ • Supply Chain    │     │ • User Scenarios  │
        │ • Brain Map       │     │ • Reports         │
        └───────────────────┘     └───────────────────┘
```

---

## 📅 Phase-by-Phase Implementation

### ✅ Phase 0: Foundation Cleanup (Week 1) - 5 Days

**Goal**: 현재 코드 정리 및 기술 부채 해결

#### Day 1-2: Component Cleanup
- [x] Audit complete (SIMLAB_AUDIT_REPORT.md created)
- [ ] Remove duplicate components:
  ```bash
  # Delete these files:
  rm apps/web/src/components/core/Sidebar.tsx
  rm apps/web/src/components/core/Header.tsx
  rm apps/web/src/components/core/NewsFeed.tsx
  rm apps/web/src/components/macro/CircuitDiagram.tsx
  rm apps/web/src/components/layout/MobileNavbar.tsx
  rm apps/web/src/components/platform/TempDashboard.tsx
  rm apps/web/src/components/visualization/NetworkGraph3D.tsx
  ```
- [ ] Update imports across codebase
- [ ] Test navigation still works

#### Day 3: Fix Element Library
**Decision Point**: Remove or Implement?

**Option A: Remove (2 hours)**
```typescript
// simulation/page.tsx
// DELETE lines 1040-1085 (entire Element Library section)
```

**Option B: Implement with dnd-kit (8-12 hours)**
```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// Implement drag-and-drop to add entities to graph
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over?.id === 'graph-canvas') {
    addEntityToGraph(active.id);
  }
};
```

**Recommendation**: Remove for now, implement in Phase 3

#### Day 4: Refactor simulation/page.tsx
**Goal**: Reduce from 1,291 lines → <300 lines

**Step 1**: Extract view components
```typescript
// Before: All inline in simulation/page.tsx
{viewMode === 'split' && (
  <div className="...">
    {/* 200+ lines of inline JSX */}
  </div>
)}

// After: Extract to components
{viewMode === 'split' && <SplitView {...props} />}
```

**Step 2**: Create component files
```bash
# Create new files:
apps/web/src/components/simulation/views/
  ├── SplitView.tsx
  ├── GlobeView.tsx
  ├── NetworkView.tsx
  ├── SupplyChainView.tsx
  ├── EconomicFlowView.tsx
  └── HedgeFundView.tsx
```

**Step 3**: Extract state management hooks
```typescript
// apps/web/src/components/simulation/hooks/useSimulationState.ts
export function useSimulationState() {
  const macroState = useMacroStore(state => state.macroState);
  const levelState = useLevelStore(state => state.levelState);
  // ... centralize state logic
  return { macroState, levelState, ... };
}
```

#### Day 5: Fix Level Control Integration
**Issue**: Level controls update store but don't trigger visualization re-render

**Fix 1**: Pass levelState to Globe3D
```typescript
// simulation/page.tsx (before)
<Globe3D
  selectedSector={selectedSector}
  showControls={false}
/>

// simulation/page.tsx (after)
<Globe3D
  selectedSector={selectedSector}
  showControls={false}
  levelState={levelState}  // ✅ Add this
  entityImpacts={entityImpacts}  // ✅ Add this
/>
```

**Fix 2**: Implement proper levelImpactCalculation
```typescript
// lib/utils/levelImpactCalculation.ts
export function calculateAllEntityImpacts(levelState: LevelState): Map<string, EntityImpact> {
  const impacts = new Map<string, EntityImpact>();

  // Implement actual formulas from levelSpecificControls.ts
  Object.entries(levelState).forEach(([controlId, value]) => {
    const control = findControl(controlId);
    if (control.impactFormula) {
      const impact = evaluateFormula(control.impactFormula, value);
      // Apply to affected entities
      getAffectedEntities(controlId).forEach(entityId => {
        impacts.set(entityId, calculateImpact(entityId, impact));
      });
    }
  });

  return impacts;
}
```

**Fix 3**: Trigger CascadeEffects on level changes
```typescript
// simulation/page.tsx
const [levelChanging, setLevelChanging] = useState(false);
const [changedLevelId, setChangedLevelId] = useState<string | null>(null);

<LevelControlPanel
  onControlChange={(level, controlId, value) => {
    setLevelChanging(true);
    setChangedLevelId(controlId);
    updateLevelControl(controlId, value);
    setTimeout(() => setLevelChanging(false), 2000);
  }}
/>

{levelChanging && (
  <CascadeEffects
    sourceId={changedLevelId}
    entityImpacts={entityImpacts}
  />
)}
```

---

### 🎨 Phase 1: Design System & Layout (Week 2) - 5 Days

#### Day 1-2: Unified Design System
**Goal**: Shadcn/UI 기반 통일

**Task 1.1**: Install Shadcn/UI properly
```bash
cd apps/web
npx shadcn-ui@latest init
```

**Task 1.2**: Migrate existing components
```typescript
// Before: Custom Card
import { Card } from '@/components/ui/DesignSystem';

// After: Shadcn Card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
```

**Task 1.3**: Create theme tokens
```css
/* apps/web/src/styles/themes.css */
:root {
  /* Palantir-inspired dark theme */
  --background-primary: #0a0a0f;
  --background-secondary: #13131a;
  --background-tertiary: #1a1a24;

  --text-primary: #f5f5f7;
  --text-secondary: #a0a0ab;
  --text-tertiary: #6b6b76;

  --accent-cyan: #00d4ff;
  --accent-emerald: #00ff88;
  --accent-magenta: #ff00ff;

  --border-primary: #2a2a35;
  --border-secondary: #3a3a45;
}
```

#### Day 3: Wide Layout System
**Goal**: Full-width layout for data-heavy pages

**Implementation**:
```typescript
// apps/web/src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isWideLayout = [
    '/ceo-dashboard',
    '/simulation',
    '/ontology'
  ].includes(pathname);

  return (
    <div className="min-h-screen bg-background-primary">
      <GlobalTopNav />
      <main className={cn(
        "transition-all duration-200",
        isWideLayout
          ? "w-full px-4 py-6"
          : "max-w-7xl mx-auto px-4 py-6"
      )}>
        {children}
      </main>
    </div>
  );
}
```

#### Day 4-5: Hightopo-Style 3D Visualization
**Goal**: Match reference image (image.png) aesthetic

**Task 4.1**: Enhance Globe3D styling
```typescript
// components/visualization/Globe3D.tsx
<Canvas
  camera={{ position: [0, 0, 300], fov: 45 }}
  style={{
    background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)',
  }}
>
  <fog attach="fog" args={['#0a0a0f', 200, 500]} />
  <ambientLight intensity={0.3} color="#00d4ff" />
  {/* Hightopo-style glow effects */}
</Canvas>
```

**Task 4.2**: Add flowing arc animations
```typescript
// Implement smooth arcs like reference image
<Arc
  start={fromCoords}
  end={toCoords}
  color="#00d4ff"
  animationDuration={2000}
  glowIntensity={0.8}
/>
```

---

### 📊 Phase 2: Obsidian-Style Knowledge Graph (Week 3-4) - 10 Days

#### Day 1-3: Markdown Report System
**Goal**: [[wiki-link]] 기반 보고서 작성

**Task 2.1**: Markdown editor with link parsing
```bash
npm install @uiw/react-md-editor remark remark-wiki-link
```

```typescript
// components/reports/MarkdownEditor.tsx
import MDEditor from '@uiw/react-md-editor';

export function MarkdownEditor({ value, onChange }: EditorProps) {
  const handleChange = (newValue: string) => {
    // Parse [[entity]] links
    const linkedEntities = extractWikiLinks(newValue);
    onChange(newValue, linkedEntities);
  };

  return (
    <MDEditor
      value={value}
      onChange={handleChange}
      preview="edit"
      height={600}
    />
  );
}

// Parse [[entity]] syntax
function extractWikiLinks(markdown: string): string[] {
  const linkRegex = /\[\[(.+?)\]\]/g;
  const matches = [...markdown.matchAll(linkRegex)];
  return matches.map(m => m[1]);
}
```

**Task 2.2**: Report data model
```typescript
// lib/types/report.ts
interface AnalystReport {
  id: string;
  title: string;
  content: string; // Markdown
  linkedEntities: string[]; // Extracted [[entity]] references
  backlinks: string[]; // Reports that link to this one
  tags: string[];
  sector: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  views: number;
}
```

**Task 2.3**: Report viewer with entity linking
```typescript
// components/reports/ReportViewer.tsx
export function ReportViewer({ report }: { report: AnalystReport }) {
  return (
    <div className="report-container">
      <ReportHeader report={report} />

      {/* Markdown content with clickable [[links]] */}
      <MDEditor.Markdown
        source={report.content}
        components={{
          // Custom renderer for [[entity]] links
          text: ({ value }) => {
            const linkRegex = /\[\[(.+?)\]\]/g;
            return value.replace(linkRegex, (match, entity) =>
              `<Link to="/entity/${entity}">${entity}</Link>`
            );
          },
        }}
      />

      {/* Backlinks section */}
      <ReportBacklinks backlinks={report.backlinks} />

      {/* Related entities */}
      <RelatedEntities entities={report.linkedEntities} />
    </div>
  );
}
```

#### Day 4-6: Brain Map Visualization (liam-hq style)
**Reference**: https://github.com/liam-hq/liam

**Task 2.4**: Install react-flow for graph visualization
```bash
npm install reactflow
```

**Task 2.5**: Create ObsidianGraphView component
```typescript
// components/knowledge/ObsidianGraphView.tsx
import ReactFlow, { Node, Edge, Background, Controls } from 'reactflow';

interface GraphNode extends Node {
  data: {
    label: string;
    type: 'report' | 'entity' | 'sector';
    connections: number;
  };
}

export function ObsidianGraphView({ reports, entities }: GraphViewProps) {
  // Build graph from reports and their [[links]]
  const { nodes, edges } = useMemo(() => {
    return buildKnowledgeGraph(reports, entities);
  }, [reports, entities]);

  return (
    <div className="h-screen w-full bg-background-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={customNodeTypes}
        edgeTypes={customEdgeTypes}
      >
        <Background color="#2a2a35" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// Build graph structure
function buildKnowledgeGraph(
  reports: AnalystReport[],
  entities: Entity[]
): { nodes: GraphNode[]; edges: Edge[] } {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];

  // Add report nodes
  reports.forEach(report => {
    nodes.push({
      id: report.id,
      type: 'report',
      position: calculatePosition(report),
      data: {
        label: report.title,
        type: 'report',
        connections: report.linkedEntities.length,
      },
    });

    // Add edges to linked entities
    report.linkedEntities.forEach(entityId => {
      edges.push({
        id: `${report.id}-${entityId}`,
        source: report.id,
        target: entityId,
        type: 'smooth',
        animated: true,
      });
    });
  });

  // Add entity nodes
  entities.forEach(entity => {
    nodes.push({
      id: entity.id,
      type: 'entity',
      position: calculatePosition(entity),
      data: {
        label: entity.name,
        type: 'entity',
        connections: countReferences(entity.id, reports),
      },
    });
  });

  return { nodes, edges };
}
```

**Task 2.6**: Custom node styles (Obsidian-inspired)
```typescript
// components/knowledge/CustomNodes.tsx
function ReportNode({ data }: { data: GraphNode['data'] }) {
  return (
    <div className="report-node group">
      <div className="node-content">
        <FileText size={16} className="text-accent-cyan" />
        <span className="text-sm font-medium">{data.label}</span>
      </div>
      <div className="node-stats">
        <span className="text-xs text-text-tertiary">
          {data.connections} links
        </span>
      </div>
    </div>
  );
}

const customNodeTypes = {
  report: ReportNode,
  entity: EntityNode,
  sector: SectorNode,
};
```

#### Day 7-8: Report Search & Navigation
**Task 2.7**: Global search for reports
```typescript
// components/knowledge/ReportSearch.tsx
export function ReportSearch() {
  const [query, setQuery] = useState('');
  const results = useReportSearch(query);

  return (
    <Command className="search-dialog">
      <CommandInput
        placeholder="Search reports, entities, tags..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandGroup heading="Reports">
          {results.reports.map(report => (
            <CommandItem
              key={report.id}
              onSelect={() => navigateTo(report.id)}
            >
              <FileText className="mr-2" size={16} />
              {report.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Entities">
          {results.entities.map(entity => (
            <CommandItem
              key={entity.id}
              onSelect={() => navigateTo(entity.id)}
            >
              <Building className="mr-2" size={16} />
              {entity.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

#### Day 9-10: Integration & Polish
**Task 2.8**: Add Reports page
```typescript
// app/(dashboard)/reports/page.tsx
export default function ReportsPage() {
  const [view, setView] = useState<'list' | 'graph'>('list');

  return (
    <div className="reports-page">
      <ReportsHeader>
        <ViewToggle value={view} onChange={setView} />
        <Button onClick={() => createNewReport()}>
          <Plus size={16} /> New Report
        </Button>
      </ReportsHeader>

      {view === 'list' ? (
        <ReportList reports={reports} />
      ) : (
        <ObsidianGraphView reports={reports} entities={entities} />
      )}
    </div>
  );
}
```

---

### 🏭 Phase 3: Digital Twin Simulator (Week 5-6) - 10 Days

#### Day 1-3: H100 Supply Chain Digital Twin
**Your Example**: H100 GPU supply chain visualization

**Task 3.1**: Define digital twin data model
```typescript
// lib/types/digitalTwin.ts
interface SupplyChainDigitalTwin {
  product: {
    name: string; // "NVIDIA H100"
    category: 'GPU' | 'CPU' | 'Memory';
    specifications: Record<string, any>;
  };

  supplyChain: {
    manufacturer: {
      company: Company; // NVIDIA
      location: string;
      capacity: number;
    };
    fabrication: {
      company: Company; // TSMC
      node: string; // "4nm"
      fab: string; // "Fab 18"
      location: string; // "Tainan, Taiwan"
      capacity: number; // wafers per month
    };
    components: Array<{
      name: string; // "HBM3"
      supplier: Company; // SK Hynix
      quantity: number;
      cost: number;
      leadTime: number; // days
      criticalityScore: number; // 0-100
    }>;
    packaging: {
      company: Company; // TSMC CoWoS
      technology: string;
      capacity: number;
    };
  };

  bottlenecks: Array<{
    node: string;
    type: 'capacity' | 'lead-time' | 'cost';
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    mitigations: string[];
  }>;

  alternativeScenarios: Array<{
    name: string;
    changes: Record<string, any>;
    impact: {
      cost: number;
      leadTime: number;
      risk: number;
    };
  }>;
}
```

**Task 3.2**: Interactive supply chain visualizer
```typescript
// components/digitalTwin/SupplyChainTwin.tsx
export function SupplyChainTwin({ product }: { product: string }) {
  const twin = useSupplyChainTwin(product);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="supply-chain-twin">
      {/* 3D Visualization (Hightopo-style) */}
      <div className="twin-canvas">
        <SupplyChainCanvas3D
          nodes={twin.supplyChain}
          bottlenecks={twin.bottlenecks}
          onNodeClick={setSelectedNode}
        />
      </div>

      {/* Side panel with details */}
      {selectedNode && (
        <SupplyChainNodeDetails
          node={twin.supplyChain.find(n => n.id === selectedNode)}
          bottlenecks={twin.bottlenecks.filter(b => b.node === selectedNode)}
        />
      )}

      {/* Alternative scenarios */}
      <ScenarioComparison scenarios={twin.alternativeScenarios} />
    </div>
  );
}
```

#### Day 4-6: Data Center Construction Simulator
**Your Example**: 데이터 센터 건설 시뮬레이션

**Task 3.3**: Data center project model
```typescript
// lib/types/dataCenter.ts
interface DataCenterProject {
  // Location analysis
  location: {
    land: {
      address: string;
      sqft: number;
      cost: number;
      zoning: string;
    };
    infrastructure: {
      powerGrid: {
        capacity: number; // MW
        reliability: number; // %
        cost: number; // $/MW
      };
      cooling: {
        source: 'water' | 'air' | 'liquid';
        capacity: number; // MW thermal
        efficiency: number; // PUE
      };
      connectivity: {
        fiberLinks: number;
        bandwidth: number; // Gbps
        latency: number; // ms to major cities
      };
    };
  };

  // Scale & design
  design: {
    servers: {
      count: number;
      type: 'CPU' | 'GPU' | 'Mixed';
      gpuPerServer: number;
      cpuPerServer: number;
    };
    power: {
      totalMW: number;
      itLoadMW: number;
      coolingMW: number;
      pue: number;
    };
    space: {
      totalSqft: number;
      dataHallSqft: number;
      supportSqft: number;
    };
  };

  // Financial model
  financials: {
    capex: {
      land: number;
      construction: number;
      equipment: {
        servers: number;
        networking: number;
        power: number;
        cooling: number;
      };
      total: number;
    };
    opex: {
      power: number; // annual
      cooling: number;
      maintenance: number;
      staff: number;
      total: number;
    };
    financing: {
      debtAmount: number;
      equityAmount: number;
      debtEquityRatio: number;
      interestRate: number;
    };
    returns: {
      revenue: number; // annual
      netIncome: number;
      irr: number; // %
      paybackPeriod: number; // years
      npv: number;
    };
  };

  // Ownership structure
  ownership: {
    shareholders: Array<{
      name: string;
      type: 'Strategic' | 'Financial' | 'Management';
      stake: number; // %
      investment: number;
    }>;
    governance: {
      board: string[];
      votingRights: Record<string, number>;
    };
  };

  // Supply chain for construction
  supplyChain: {
    gpus: {
      supplier: Company; // NVIDIA
      model: string; // H100
      quantity: number;
      cost: number;
      deliverySchedule: Date[];
    };
    servers: {
      supplier: Company;
      quantity: number;
      cost: number;
    };
    // ... other components
  };
}
```

**Task 3.4**: Interactive data center simulator
```typescript
// components/digitalTwin/DataCenterSimulator.tsx
export function DataCenterSimulator() {
  const [project, setProject] = useState<DataCenterProject>(defaultProject);
  const [selectedView, setSelectedView] = useState<'3d' | 'financial' | 'ownership'>('3d');

  const handleParameterChange = (path: string, value: any) => {
    const updated = updateNestedProperty(project, path, value);
    // Recalculate all dependent values
    const recalculated = recalculateProject(updated);
    setProject(recalculated);
  };

  return (
    <div className="datacenter-simulator">
      <SimulatorHeader project={project} />

      <div className="simulator-layout">
        {/* Left: Parameter controls */}
        <div className="parameter-panel">
          <Tabs>
            <TabsList>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
            </TabsList>

            <TabsContent value="location">
              <LocationControls
                location={project.location}
                onChange={(loc) => handleParameterChange('location', loc)}
              />
            </TabsContent>

            <TabsContent value="design">
              <DesignControls
                design={project.design}
                onChange={(des) => handleParameterChange('design', des)}
              />
            </TabsContent>

            {/* ... other tabs */}
          </Tabs>
        </div>

        {/* Right: Visualization */}
        <div className="visualization-panel">
          {selectedView === '3d' && (
            <DataCenter3DView project={project} />
          )}
          {selectedView === 'financial' && (
            <FinancialDashboard financials={project.financials} />
          )}
          {selectedView === 'ownership' && (
            <OwnershipChart ownership={project.ownership} />
          )}
        </div>
      </div>

      {/* Bottom: Key metrics */}
      <ProjectMetrics project={project} />
    </div>
  );
}
```

**Task 3.5**: Financial calculations
```typescript
// lib/utils/dataCenterFinancials.ts
export function recalculateProject(project: DataCenterProject): DataCenterProject {
  const updated = { ...project };

  // 1. Calculate total power requirement
  const gpuPower = project.design.servers.count *
    project.design.servers.gpuPerServer *
    0.7; // 700W per H100

  const totalITPower = gpuPower + cpuPower + networkingPower;
  const totalPower = totalITPower * project.design.power.pue;

  updated.design.power.totalMW = totalPower / 1000;

  // 2. Calculate CAPEX
  updated.financials.capex = {
    land: project.location.land.cost,
    construction: project.design.space.totalSqft * 500, // $500/sqft
    equipment: {
      servers: project.design.servers.count * 100000, // $100k per server
      networking: totalPower * 50000, // $50k per MW
      power: totalPower * 1000000, // $1M per MW
      cooling: totalPower * 800000, // $800k per MW
    },
    total: 0, // calculated below
  };
  updated.financials.capex.total =
    updated.financials.capex.land +
    updated.financials.capex.construction +
    Object.values(updated.financials.capex.equipment).reduce((a, b) => a + b);

  // 3. Calculate OPEX
  const powerCostPerYear = totalPower * 8760 * 0.12; // $0.12/kWh
  updated.financials.opex = {
    power: powerCostPerYear,
    cooling: powerCostPerYear * 0.3,
    maintenance: updated.financials.capex.total * 0.05, // 5% of CAPEX
    staff: 50 * 150000, // 50 staff @ $150k
    total: 0,
  };
  updated.financials.opex.total = Object.values(updated.financials.opex)
    .filter(v => typeof v === 'number')
    .reduce((a, b) => a + b);

  // 4. Calculate returns
  const revenuePerGPU = 30000; // $30k per H100 per year
  const totalGPUs = project.design.servers.count * project.design.servers.gpuPerServer;
  const annualRevenue = totalGPUs * revenuePerGPU;

  updated.financials.returns = {
    revenue: annualRevenue,
    netIncome: annualRevenue - updated.financials.opex.total,
    irr: calculateIRR(project),
    paybackPeriod: updated.financials.capex.total / updated.financials.returns.netIncome,
    npv: calculateNPV(project, 0.12), // 12% discount rate
  };

  // 5. Recalculate ownership stakes
  const totalInvestment = updated.financials.financing.debtAmount +
    updated.financials.financing.equityAmount;

  updated.ownership.shareholders = updated.ownership.shareholders.map(sh => ({
    ...sh,
    stake: (sh.investment / updated.financials.financing.equityAmount) * 100,
  }));

  return updated;
}
```

#### Day 7-8: 3D Visualization (Hightopo-style)
**Task 3.6**: Data center 3D view
```typescript
// components/digitalTwin/DataCenter3DView.tsx
export function DataCenter3DView({ project }: { project: DataCenterProject }) {
  return (
    <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
      {/* Background */}
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 100, 300]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} color="#00d4ff" />
      <spotLight position={[50, 100, 50]} intensity={0.5} color="#00ff88" />

      {/* Land plot */}
      <LandPlot size={project.location.land.sqft} />

      {/* Building structure */}
      <DataCenterBuilding
        dimensions={{
          width: Math.sqrt(project.design.space.totalSqft),
          length: Math.sqrt(project.design.space.totalSqft),
          height: 20,
        }}
      />

      {/* Server racks (simplified) */}
      <ServerRacks count={project.design.servers.count} />

      {/* Power and cooling infrastructure */}
      <PowerSubstation capacity={project.design.power.totalMW} />
      <CoolingTowers capacity={project.design.power.coolingMW} />

      {/* Flowing connection lines (Hightopo-style) */}
      <FlowingArcs
        connections={[
          { from: 'power', to: 'servers', color: '#00d4ff' },
          { from: 'servers', to: 'cooling', color: '#ff6b6b' },
          { from: 'cooling', to: 'output', color: '#00ff88' },
        ]}
      />

      {/* Controls */}
      <OrbitControls />
    </Canvas>
  );
}
```

#### Day 9-10: Scenario Comparison
**Task 3.7**: Compare multiple data center configurations
```typescript
// components/digitalTwin/ScenarioComparison.tsx
export function ScenarioComparison() {
  const [scenarios, setScenarios] = useState<DataCenterProject[]>([
    createScenario('Small - 1000 servers'),
    createScenario('Medium - 5000 servers'),
    createScenario('Large - 10000 servers'),
  ]);

  return (
    <div className="scenario-comparison">
      <ComparisonTable
        scenarios={scenarios}
        metrics={[
          'Total CAPEX',
          'Annual OPEX',
          'Revenue',
          'IRR',
          'Payback Period',
          'NPV',
        ]}
      />

      <ComparisonCharts scenarios={scenarios} />
    </div>
  );
}
```

---

### 🎪 Phase 4: Polymarket-Style Community (Week 7) - 5 Days

#### Day 1-2: Scenario Creation UI
**Task 4.1**: User scenario builder
```typescript
// components/community/ScenarioBuilder.tsx
export function ScenarioBuilder() {
  const [scenario, setScenario] = useState<UserScenario>({
    title: '',
    description: '',
    macroSettings: {},
    levelSettings: {},
    predictions: [],
  });

  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Scenario</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="macro">Macro Settings</TabsTrigger>
            <TabsTrigger value="levels">Level Controls</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="space-y-4">
              <Input
                placeholder="Scenario title..."
                value={scenario.title}
                onChange={(e) => setScenario({ ...scenario, title: e.target.value })}
              />
              <Textarea
                placeholder="Describe your scenario..."
                value={scenario.description}
                onChange={(e) => setScenario({ ...scenario, description: e.target.value })}
              />
              <TagInput
                tags={scenario.tags}
                onChange={(tags) => setScenario({ ...scenario, tags })}
              />
            </div>
          </TabsContent>

          <TabsContent value="macro">
            <MacroSettingsEditor
              settings={scenario.macroSettings}
              onChange={(settings) => setScenario({ ...scenario, macroSettings: settings })}
            />
          </TabsContent>

          {/* ... other tabs */}
        </Tabs>

        <DialogFooter>
          <Button onClick={() => publishScenario(scenario)}>
            Publish Scenario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Day 3-4: Scenario Marketplace
**Task 4.2**: Community scenario feed
```typescript
// app/(dashboard)/community/scenarios/page.tsx
export default function ScenarioMarketplace() {
  const [filter, setFilter] = useState<'trending' | 'new' | 'top'>('trending');
  const scenarios = useScenarios({ filter, limit: 20 });

  return (
    <div className="scenario-marketplace">
      <MarketplaceHeader>
        <FilterTabs value={filter} onChange={setFilter}>
          <Tab value="trending">🔥 Trending</Tab>
          <Tab value="new">✨ New</Tab>
          <Tab value="top">⭐ Top Rated</Tab>
        </FilterTabs>
        <Button onClick={() => openScenarioBuilder()}>
          <Plus size={16} /> Create Scenario
        </Button>
      </MarketplaceHeader>

      <div className="scenario-grid">
        {scenarios.map(scenario => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onVote={(vote) => voteScenario(scenario.id, vote)}
            onClick={() => loadAndRunScenario(scenario)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Task 4.3**: Voting and ranking system
```typescript
// lib/hooks/useScenarioVoting.ts
export function useScenarioVoting(scenarioId: string) {
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const vote = async (direction: 'up' | 'down') => {
    // Optimistic update
    setUserVote(direction);
    setVotes(votes + (direction === 'up' ? 1 : -1));

    // API call
    await api.voteScenario(scenarioId, direction);
  };

  return { votes, userVote, vote };
}
```

#### Day 5: Leaderboard & Achievements
**Task 4.4**: Community leaderboard
```typescript
// components/community/Leaderboard.tsx
export function CommunityLeaderboard() {
  const leaders = useLeaderboard({ period: '30d', limit: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributors (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="leaderboard-list">
          {leaders.map((user, idx) => (
            <div key={user.id} className="leaderboard-item">
              <div className="rank">#{idx + 1}</div>
              <Avatar user={user} />
              <div className="user-info">
                <div className="name">{user.name}</div>
                <div className="stats">
                  {user.scenariosCreated} scenarios • {user.totalVotes} votes
                </div>
              </div>
              <Badge variant={getTierBadge(idx)}>
                {getTierName(idx)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 🎯 Phase 5: Admin & Architecture View (Week 8) - 5 Days

#### Day 1-3: System Architecture Viewer
**Your Request**: "전체 아키텍쳐도 admin에서 볼 수 있으면 좋겠다"

**Task 5.1**: Architecture diagram generator
```typescript
// app/(dashboard)/ceo-dashboard/architecture/page.tsx
export default function ArchitecturePage() {
  const architecture = useSystemArchitecture();

  return (
    <div className="architecture-page">
      <ArchitectureHeader />

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <ComponentDiagram architecture={architecture} />
        </TabsContent>

        <TabsContent value="dataflow">
          <DataFlowDiagram architecture={architecture} />
        </TabsContent>

        {/* ... other views */}
      </Tabs>
    </div>
  );
}
```

**Task 5.2**: Component dependency graph
```typescript
// components/admin/ComponentDiagram.tsx
export function ComponentDiagram({ architecture }: { architecture: SystemArchitecture }) {
  const { nodes, edges } = useMemo(() => {
    return buildArchitectureGraph(architecture);
  }, [architecture]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={{
        component: ComponentNode,
        store: StoreNode,
        api: APINode,
      }}
      edgeTypes={{
        dataflow: DataFlowEdge,
        dependency: DependencyEdge,
      }}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

// Auto-generate from codebase
function buildArchitectureGraph(architecture: SystemArchitecture) {
  // Scan codebase and build dependency graph
  const components = scanComponents();
  const stores = scanStores();
  const apis = scanAPIs();

  // Build nodes
  const nodes = [
    ...components.map(c => ({ id: c.path, type: 'component', data: c })),
    ...stores.map(s => ({ id: s.path, type: 'store', data: s })),
    ...apis.map(a => ({ id: a.path, type: 'api', data: a })),
  ];

  // Build edges from imports
  const edges = scanImports().map(imp => ({
    source: imp.from,
    target: imp.to,
    type: 'dependency',
  }));

  return { nodes, edges };
}
```

#### Day 4-5: Performance & Health Monitoring
**Task 5.3**: System health dashboard
```typescript
// components/admin/HealthDashboard.tsx
export function HealthDashboard() {
  const health = useSystemHealth();

  return (
    <div className="health-dashboard">
      <div className="metrics-grid">
        <MetricCard
          title="API Latency"
          value={health.apiLatency}
          unit="ms"
          status={health.apiLatency < 200 ? 'good' : 'warning'}
        />
        <MetricCard
          title="Error Rate"
          value={health.errorRate}
          unit="%"
          status={health.errorRate < 1 ? 'good' : 'critical'}
        />
        <MetricCard
          title="Active Users"
          value={health.activeUsers}
          unit=""
          status="good"
        />
        <MetricCard
          title="Memory Usage"
          value={health.memoryUsage}
          unit="%"
          status={health.memoryUsage < 80 ? 'good' : 'warning'}
        />
      </div>

      <ComponentHealthList components={health.components} />
    </div>
  );
}
```

---

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] All duplicate components removed
- [ ] simulation/page.tsx refactored (<300 lines)
- [ ] Design system unified (Shadcn/UI)
- [ ] Wide layout implemented
- [ ] Level controls properly connected
- [ ] Error handling added to all calculations
- [ ] TypeScript strict mode enabled
- [ ] All tests passing

### Features
- [ ] Obsidian-style knowledge graph working
- [ ] Markdown reports with [[links]] functional
- [ ] Brain map visualization complete
- [ ] Digital Twin simulator (H100 supply chain)
- [ ] Data center construction simulator
- [ ] Polymarket-style scenario marketplace
- [ ] Community voting and leaderboard
- [ ] Admin architecture view

### Performance
- [ ] All components use dynamic imports where appropriate
- [ ] Memoization added to expensive calculations
- [ ] Virtual scrolling for long lists
- [ ] Image optimization
- [ ] Bundle size <500KB (main)

### Polish
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Keyboard navigation
- [ ] Loading states
- [ ] Error boundaries
- [ ] 404 pages
- [ ] Accessibility (WCAG AA)

---

## 📞 Next Steps

1. **Review this roadmap** and prioritize phases
2. **Answer clarifying questions** from SIMLAB_AUDIT_REPORT.md
3. **Approve Phase 0** to begin cleanup
4. **Set deadlines** for each phase

Ready to start implementation? Let me know which phase to begin with!
