# SimLab Architecture Audit Report
## 완전한 재설계 제안 (Complete Redesign Proposal)

Date: 2025-11-12
Status: Critical Issues Identified

---

## 🎯 당신의 비전 (Your Vision)

**Goal**: Polymarket + Palantir + Obsidian 통합 플랫폼
- **Polymarket 요소**: 사용자가 테마/주제를 정의하고, 시뮬레이션 시나리오에 투표
- **Palantir 요소**: 금융 데이터 온톨로지, 디지털 트윈 (H100 supply chain, data center 건설 시뮬레이션)
- **Obsidian 요소**: Analyst 보고서를 Markdown으로 작성, Brain map/Network 그래프로 지식 연결
- **Digital Twin**: 실제 데이터 센터 건설 시뮬레이션 (땅, 규모, 자금 구조, 지분 비율)

**Reference Image**: image.png - Hightopo style 3D visualization with logistics/supply chain

---

## 🔴 Critical Issues Found (현재 문제점)

### 1. **비기능적 Interactive 요소 (Non-Functional Elements)**

#### Issue 1.1: Element Library는 "Coming Soon"만 표시
**Location**: `/app/(dashboard)/simulation/page.tsx:1051-1084`
```typescript
// Element Library는 단순히 placeholder만 있음
<p className="text-xs text-text-tertiary px-2">
  Drag & drop elements to create custom relationships (Coming Soon)
</p>
```
**Problem**:
- 드래그 앤 드롭 기능이 실제로 구현되지 않음
- 요소들이 cursor-move로 표시되지만 실제 동작 없음
- 사용자는 클릭해도 아무 반응 없음

**Solution Needed**:
- React DnD 또는 dnd-kit 라이브러리로 실제 드래그 기능 구현
- 드롭한 요소를 온톨로지 그래프에 추가하는 로직 필요
- 또는 이 기능을 완전히 제거하고 다른 방식으로 재설계

---

#### Issue 1.2: LevelControlPanel - 9-Level 요소 상호작용 문제
**Location**: `/components/simulation/LevelControlPanel.tsx`

**Current Implementation**:
```typescript
const handleChange = (level: number, control: LevelControl, value: number) => {
  setControlValues(prev => ({
    ...prev,
    [control.id]: value
  }));
  onControlChange?.(level, control.id, value);
};
```

**Discovered Issues**:
1. ✅ **슬라이더는 작동함** - onChange 이벤트가 제대로 연결됨
2. ⚠️ **Impact calculation은 실행되지만 UI에 반영 안 됨** - 계산 결과가 시각화되지 않음
3. ❌ **Globe3D/ForceNetworkGraph3D가 levelState 변경을 감지 안 함** - 컴포넌트가 리렌더링되지 않음

**Root Cause**:
```typescript
// simulation/page.tsx:569-574
<LevelControlPanel
  onControlChange={(level, controlId, value) => {
    console.log(`Level ${level} - ${controlId}: ${value}`); // ✅ 로그는 찍힘
    updateLevelControl(controlId, value); // ✅ Store는 업데이트됨
  }}
/>

// 하지만 Globe3D는 levelState를 prop으로 받지 않음!
<Globe3D
  selectedSector={selectedSector}
  showControls={false}
  // ❌ levelState가 전달되지 않음!
/>
```

**Solution Needed**:
- Globe3D에 `levelState` prop 추가
- `entityImpacts`를 시각화하는 UI 컴포넌트 추가
- CascadeEffects가 level 변경 시에도 트리거되도록 수정

---

### 2. **레이아웃 문제 (Layout Issues)**

#### Issue 2.1: Navigation 중복 및 일관성 없음
**Locations**:
- `/components/layout/Sidebar.tsx` - 기존 레거시 사이드바 (사용 안 됨)
- `/components/layout/GlobalTopNav.tsx` - 현재 사용 중
- `/components/core/Sidebar.tsx` - 또 다른 중복

**Problem**:
```typescript
// layout.tsx는 GlobalTopNav만 사용
<div className="min-h-screen bg-black">
  <GlobalTopNav />
  <main>{children}</main>
</div>

// 하지만 Sidebar 컴포넌트가 3개나 존재 (혼란스러움)
```

**Solution**:
- `/components/core/*` 와 `/components/layout/*`의 중복 제거
- GlobalTopNav를 유지하고 나머지 삭제
- 일관된 네이밍과 구조로 재정리

---

#### Issue 2.2: Wide Layout 지원 안 함
**Current**: 모든 페이지가 동일한 좁은 레이아웃
**Needed**:
- Admin/CEO Dashboard에서 full-width 레이아웃
- 참고 이미지 (image.png)처럼 넓은 캔버스에 3D 시각화

**Solution**:
```typescript
// layout variants 추가
<main className={cn(
  pathname === '/ceo-dashboard' ? 'w-full' : 'max-w-7xl mx-auto',
  'px-4 py-6'
)}>
  {children}
</main>
```

---

### 3. **디자인 일관성 문제 (Design Inconsistency)**

#### Issue 3.1: 여러 디자인 시스템이 혼재
**Found**:
- `/components/ui/DesignSystem.tsx` - 커스텀 Card, Button
- `/components/ui/Card.tsx` - 개별 Card 컴포넌트
- `/components/ui/InteractiveCard.tsx` - 또 다른 Card 변형
- Shadcn/UI 컴포넌트도 일부 사용

**Problem**: 일관성 없는 스타일링, 중복된 컴포넌트

**Solution**:
- Shadcn/UI를 기본으로 통일
- DesignSystem.tsx를 Shadcn 래퍼로 변경
- 중복 제거

---

#### Issue 3.2: 색상/테마 시스템 불완전
**Current**: Tailwind CSS classes 하드코딩
```typescript
className="bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20"
```

**Needed**:
- CSS Variables로 테마 시스템 구축
- Dark mode 지원 (현재는 black만 지원)
- Polymarket/Palantir 스타일의 프로페셔널한 다크 테마

---

### 4. **Architecture 문제 (Architecture Issues)**

#### Issue 4.1: Monolithic Simulation Page (1,291 lines)
**Location**: `/app/(dashboard)/simulation/page.tsx`

**Problem**:
- 너무 많은 로직이 한 파일에 집중
- 8개의 view modes가 모두 inline으로 구현
- State management가 복잡하고 추적하기 어려움

**Current Structure**:
```
simulation/page.tsx (1,291 lines)
├── Macro Controls (inline)
├── Level Controls (component)
├── Element Library (inline, non-functional)
├── Scenario Management (inline)
├── View Modes:
│   ├── Split View (inline)
│   ├── Globe View (inline)
│   ├── Network View (inline)
│   ├── Supply Chain View (inline)
│   ├── Economic Flow View (component)
│   └── Hedge Fund View (component)
└── Save/Load Dialogs (inline)
```

**Proposed Refactor**:
```
simulation/
├── page.tsx (200 lines max - orchestration only)
├── components/
│   ├── SimulationHeader.tsx
│   ├── MacroControlSection.tsx
│   ├── LevelControlSection.tsx
│   ├── ViewModeTabs.tsx
│   ├── ScenarioManager.tsx
│   └── views/
│       ├── SplitView.tsx
│       ├── GlobeView.tsx
│       ├── NetworkView.tsx
│       ├── SupplyChainView.tsx
│       ├── EconomicFlowView.tsx
│       └── HedgeFundView.tsx
└── hooks/
    ├── useSimulationState.ts
    └── useScenarioManagement.ts
```

---

#### Issue 4.2: Unused/Duplicate Components
**Duplicates Found**:
1. **Sidebar** - 3 versions
   - `/components/layout/Sidebar.tsx`
   - `/components/core/Sidebar.tsx`
   - Only GlobalTopNav is used

2. **Header** - 2 versions
   - `/components/layout/Header.tsx`
   - `/components/core/Header.tsx`

3. **NewsFeed** - 2 versions
   - `/components/platform/NewsFeed.tsx`
   - `/components/core/NewsFeed.tsx`

4. **CircuitDiagram** - 2 versions
   - `/components/visualization/CircuitDiagram.tsx`
   - `/components/macro/CircuitDiagram.tsx`

**Unused Components**:
- `/components/layout/MobileNavbar.tsx` - Not imported anywhere
- `/components/platform/TempDashboard.tsx` - Placeholder
- `/components/visualization/NetworkGraph3D.tsx` - Alternative to ForceNetworkGraph3D

**Action**: Delete or consolidate duplicates

---

### 5. **Simulation Logic 검증 (Formula Verification)**

#### 5.1: Economic Flows Calculation
**Location**: `/lib/utils/economicFlows.ts`

**Review**:
```typescript
// Fed Rate Change Impact
const fedRateChange = currentMacro.fed_funds_rate - previousMacro.fed_funds_rate;
flows.push({
  from: 'Federal Reserve',
  to: 'Banking Sector',
  type: 'policy',
  magnitude: Math.abs(fedRateChange) * 100, // ✅ Basis points conversion
  impact: fedRateChange > 0 ? 'positive' : 'negative',
  multiplier: 15.0, // ❓ Hard-coded multiplier - where does 15x come from?
  description: `Fed ${fedRateChange > 0 ? 'raised' : 'cut'} rates...`,
});
```

**Issues**:
1. ❓ **Multiplier 값들이 하드코딩됨** (15.0, -10.0, -5.0) - 경제학적 근거 불명확
2. ⚠️ **No error handling** - NaN이나 Infinity 처리 없음
3. ⚠️ **No bounds checking** - magnitude가 너무 커질 수 있음

**Recommendation**:
```typescript
// Add constants with references
const MULTIPLIERS = {
  FED_TO_BANK_NIM: 15.0,        // Source: Federal Reserve research on NIM sensitivity
  BANK_TO_CORP_CREDIT: -10.0,   // Source: BIS credit impulse studies
  CORP_TO_CONSUMER: -5.0,       // Source: Input-output tables
} as const;

// Add validation
const safeMagnitude = Math.min(
  Math.abs(fedRateChange) * 100,
  1000 // Max 1000 bps
);
```

---

#### 5.2: Macro Impact Calculation
**Location**: `/lib/utils/impactCalculation.ts`

**Review**: ✅ Linkage matrix 기반 계산은 올바름
```typescript
export function calculateAllImpacts(
  macroState: MacroState,
  linkages: Linkage[]
): SectorImpacts {
  // Sophisticated multi-variable impact calculation
  // ✅ Proper handling of non-linear relationships
  // ✅ Linkage-based approach is sound
}
```

**Issues**:
1. ⚠️ **No caching** - 매번 전체 계산 (성능 문제 가능)
2. ⚠️ **No time decay** - 과거 변화의 영향이 영원히 지속됨

**Recommendation**:
- Add memoization for expensive calculations
- Implement time decay for historical impacts

---

#### 5.3: Level Impact Calculation
**Location**: `/lib/utils/levelImpactCalculation.ts`

**Found**: 이 파일은 import되지만 실제 로직이 간단함
```typescript
export function calculateAllEntityImpacts(levelState: LevelState): Map<string, EntityImpact> {
  // ❌ Placeholder implementation - not using proper formulas
  const impacts = new Map<string, EntityImpact>();

  // TODO: Implement actual impact calculations based on:
  // - levelSpecificControls.ts의 impactFormula
  // - Entity knowledge graph

  return impacts;
}
```

**Critical Issue**: **Level controls가 실제로 계산에 사용되지 않음!**

**Solution**: Implement proper level-based impact calculation using formulas from `levelSpecificControls.ts`

---

### 6. **Missing Features for Your Vision**

#### 6.1: Polymarket-Style Community Features
**Current**:
- ✅ Supply Chain scenarios with voting (partial)
- ❌ User-created scenarios
- ❌ Scenario marketplace
- ❌ Community leaderboard

**Needed**:
```typescript
// Scenario creation flow
interface UserScenario {
  id: string;
  createdBy: User;
  title: string;
  description: string;
  macroSettings: MacroState;
  levelSettings: LevelState;
  predictions: Prediction[];
  votes: number;
  comments: Comment[];
  createdAt: Date;
}
```

---

#### 6.2: Obsidian-Style Knowledge Graph
**Current**:
- ✅ ForceNetworkGraph3D exists
- ❌ No Markdown report linking
- ❌ No brain map visualization
- ❌ No backlink support

**Needed**:
- Implement like https://github.com/liam-hq/liam (reference from user)
- Markdown reports with [[wiki-style]] links
- Graph view showing report connections
- Sector → Company → Product relationships as network

**Implementation Plan**:
```typescript
// Report linking system
interface AnalystReport {
  id: string;
  title: string;
  content: string; // Markdown with [[links]]
  linkedEntities: string[]; // Extracted from [[entity]] syntax
  linkedReports: string[]; // Backlinks
  tags: string[];
  author: User;
}

// Brain map visualization
<ObsidianGraphView
  reports={reports}
  entities={entities}
  onNodeClick={(node) => navigateToReport(node)}
/>
```

---

#### 6.3: Palantir-Style Data Integration & Digital Twin
**Current**:
- ✅ Supply chain visualization exists
- ❌ No real-time data feeds
- ❌ No digital twin simulation (data center construction example)

**Your Example**: H100 GPU supply chain digital twin
- H100 chips → 어느 회사 (NVIDIA)
- → 어디서 제조 (TSMC)
- → 어떤 components 필요 (HBM from SK Hynix, CoWoS packaging)
- → 데이터 센터 건설 시
  - 어떤 땅에 (location analysis)
  - 얼마만큼의 규모 (power, cooling, space requirements)
  - 자금 구조 (debt/equity split)
  - 지분 비율 (ownership structure)

**Implementation Needed**:
```typescript
// Digital Twin Simulator
interface DataCenterProject {
  location: {
    land: LandParcel;
    powerGrid: PowerCapacity;
    coolingSource: CoolingSystem;
  };
  scale: {
    servers: number;
    gpuCount: number;
    powerMW: number;
    sqft: number;
  };
  financials: {
    totalCost: number;
    debtEquitySplit: { debt: number; equity: number };
    ownership: Shareholder[];
  };
  supplyChain: {
    gpuProvider: Company;
    manufacturer: Company;
    componentSuppliers: Company[];
  };
}

<DigitalTwinSimulator
  project={datacenterProject}
  onParameterChange={(param, value) => recalculateAll()}
/>
```

---

#### 6.4: Architecture Visualization (Admin View)
**Current**: ❌ No admin view for architecture

**Your Request**:
> "전체 아키텍쳐도 admin에서 볼 수 있으면 좋겠다"

**Needed**: CEO Dashboard에 시스템 아키텍처 시각화
```typescript
// System Architecture View
<ArchitectureDiagram
  components={getAllComponents()}
  dataFlows={getDataFlows()}
  healthStatus={getSystemHealth()}
/>

// Show:
// - Component dependencies
// - Data flow between services
// - Performance metrics
// - Error rates
```

---

## 📋 Proposed Redesign Plan

### Phase 1: 기초 정리 (Foundation Cleanup) - Week 1

**Tasks**:
1. **Remove duplicates**
   - Delete unused Sidebar versions
   - Consolidate Header components
   - Remove TempDashboard, MobileNavbar

2. **Fix Level Control integration**
   - Connect levelState to visualizations
   - Implement proper entityImpacts calculation
   - Add visual feedback when levels change

3. **Break up simulation/page.tsx**
   - Extract view components
   - Create custom hooks for state management
   - Reduce to <300 lines

4. **Design system unification**
   - Standardize on Shadcn/UI
   - Create theme tokens
   - Document component usage

---

### Phase 2: Core Features (당신의 비전 구현) - Week 2-3

**2.1: Polymarket-Style Community**
- [ ] User scenario creation UI
- [ ] Scenario voting/ranking system
- [ ] Community leaderboard
- [ ] Scenario marketplace

**2.2: Obsidian-Style Knowledge Graph**
- [ ] Markdown editor with [[link]] syntax
- [ ] Report relationship extraction
- [ ] Brain map visualization (using liam-hq style)
- [ ] Backlink support

**2.3: Palantir-Style Ontology**
- [ ] Full ontology viewer (beyond current 9-level)
- [ ] Entity relationship editor
- [ ] Data lineage tracking
- [ ] Real-time data integration

---

### Phase 3: Digital Twin Features - Week 4

**3.1: H100 Supply Chain Digital Twin**
- [ ] Component mapping (GPU → HBM → TSMC → SK Hynix)
- [ ] Interactive supply chain diagram
- [ ] Bottleneck analysis
- [ ] Alternative scenario planning

**3.2: Data Center Construction Simulator**
- [ ] Location analysis (power, cooling, connectivity)
- [ ] Scale calculator (servers, power, space)
- [ ] Financial modeling (debt/equity, IRR, payback)
- [ ] Ownership structure visualizer

**3.3: Wide Layout for Visualization**
- [ ] Full-width layout for CEO dashboard
- [ ] Hightopo-style 3D visualization
- [ ] Multi-panel layout system

---

### Phase 4: Advanced Analytics - Week 5

**4.1: Enhanced Simulations**
- [ ] Monte Carlo simulation
- [ ] Sensitivity analysis
- [ ] Scenario comparison
- [ ] Time-series playback with events

**4.2: AI Integration**
- [ ] LLM-powered scenario generation
- [ ] Automated report writing
- [ ] Anomaly detection
- [ ] Predictive analytics

**4.3: Admin/Architecture View**
- [ ] System architecture diagram
- [ ] Component dependency graph
- [ ] Performance monitoring
- [ ] Error tracking

---

## 🔧 Immediate Action Items (우선순위)

### 🚨 Critical (This Week)
1. **Fix Element Library** - Either implement or remove
2. **Fix Level Control → Visualization connection**
3. **Remove duplicate components**
4. **Break up simulation/page.tsx**

### ⚠️ High Priority (Next Week)
5. **Implement proper levelImpactCalculation**
6. **Add error handling to formulas**
7. **Create wide layout variant**
8. **Design system unification**

### 📌 Medium Priority (Week 3-4)
9. **Obsidian-style report linking**
10. **Polymarket-style scenario marketplace**
11. **Digital Twin simulator skeleton**
12. **Admin architecture view**

---

## 📊 Current vs. Target Architecture

### Current (문제점)
```
┌─────────────────────────────────────┐
│   Monolithic simulation/page.tsx    │
│         (1,291 lines)                │
│                                      │
│  ├── Macro Controls (inline)        │
│  ├── Level Controls (component)     │
│  ├── 8 View Modes (mostly inline)   │
│  ├── Element Library (broken)       │
│  └── Save/Load (inline)              │
└─────────────────────────────────────┘
         ↓
   ❌ Hard to maintain
   ❌ Duplicate code
   ❌ No clear data flow
```

### Target (목표)
```
┌───────────────────────────────────────────────────┐
│               Platform Hub                        │
│  (Polymarket + Palantir + Obsidian)              │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Community  │  │   Knowledge  │  │ Digital │ │
│  │  Scenarios  │  │    Graph     │  │  Twin   │ │
│  │  (Polymarket)│  │  (Obsidian)  │  │(Palantir)│ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
│                                                   │
├───────────────────────────────────────────────────┤
│              Simulation Engine                    │
│  ┌──────────┐  ┌────────┐  ┌─────────────────┐  │
│  │  Macro   │  │ Level  │  │  Supply Chain   │  │
│  │  Store   │  │ Store  │  │  Propagation    │  │
│  └──────────┘  └────────┘  └─────────────────┘  │
├───────────────────────────────────────────────────┤
│             Visualization Layer                   │
│  ┌──────┐  ┌────────┐  ┌────────┐  ┌─────────┐  │
│  │Globe │  │Network │  │ Supply │  │  Brain  │  │
│  │ 3D   │  │ Graph  │  │ Chain  │  │   Map   │  │
│  └──────┘  └────────┘  └────────┘  └─────────┘  │
└───────────────────────────────────────────────────┘
```

---

## 💡 Recommendations Summary

### Architecture
1. ✅ Keep current 9-level ontology system (well-designed)
2. ⚠️ Refactor monolithic files into smaller components
3. ❌ Remove all duplicate components
4. ✅ Add proper error handling and validation

### Features
1. 🎯 Prioritize Obsidian-style knowledge graph (unique value)
2. 🎯 Implement Digital Twin simulator (differentiator)
3. 🎯 Add community scenario creation (engagement)
4. 📊 Enhanced admin/architecture view (your request)

### Design
1. 🎨 Unify on Shadcn/UI design system
2. 🎨 Implement proper theme system with CSS variables
3. 🎨 Create wide layout variant for data-heavy views
4. 🎨 Match Hightopo reference image aesthetic

### Code Quality
1. 🔧 Add TypeScript strict mode
2. 🔧 Implement proper error boundaries
3. 🔧 Add unit tests for calculation utilities
4. 🔧 Document formulas with economic references

---

## 📝 Next Steps

I'll now create a detailed implementation plan and start refactoring based on your approval.

**Questions for you**:
1. ✅ Should I remove Element Library or implement drag-and-drop?
2. ✅ Priority: Obsidian graph vs Digital Twin vs Community features?
3. ✅ Keep current dark theme or change to match Palantir style?
4. ✅ Target timeline for Phase 1 completion?

Please review this audit and let me know which issues to tackle first!
