/**
 * Date-Based Simulation Engine
 *
 * 실제 날짜를 사용하여 시간에 따른 경제 변화를 시뮬레이션합니다.
 * 예: 2024-01-01 → 2024-02-01 → 2024-03-01 ...
 */

import { MacroState } from '@/lib/store/macroStore';
import { LevelState } from '@/lib/store/levelStore';
import { ALL_EXPANDED_ENTITIES, Entity } from '@/data/expandedKnowledgeGraph';

export interface DateSnapshot {
  date: Date;
  timestamp: number;
  description: string;
  macroState: MacroState;
  levelState: LevelState;
  entityValues: Map<string, EntitySnapshot>; // 각 엔티티의 실제 값
  events: SimulationEvent[]; // 이 날짜에 발생한 이벤트들
}

export interface EntitySnapshot {
  entityId: string;
  entityName: string;
  entityType: string;

  // 실제 값들 (시각화에 직접 사용)
  value: number; // 주가, 매출, 점유율 등의 정규화된 값 (0-100)
  revenue?: number; // 실제 매출 (백만 달러)
  marketShare?: number; // 시장 점유율 (%)
  production?: number; // 생산량
  demand?: number; // 수요
  price?: number; // 가격

  // 변화량
  changeFromPrevious: number; // 전 기간 대비 변화 (%)
  changeRate: number; // 변화율 (%)

  // 시각화를 위한 속성
  color: string; // 노드 색상
  size: number; // 노드 크기
  opacity: number; // 투명도

  // 상태
  isGrowing: boolean; // 성장 중인가
  volatility: number; // 변동성 (0-1)
}

export interface SimulationEvent {
  date: Date;
  title: string;
  description: string;
  affectedEntities: string[]; // 영향받은 엔티티 ID들
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number; // 영향의 크기 (0-1)
}

export interface DateSimulationConfig {
  startDate: Date;
  endDate: Date;
  intervalDays: number; // 간격 (일 단위, 예: 30일 = 1개월)
  volatility: number; // 변동성 (0-1)
  growthRate: number; // 기본 성장률 (연간 %)
  randomness: number; // 랜덤성 (0-1)
}

/**
 * 날짜 기반 시뮬레이션 실행
 */
export function runDateBasedSimulation(
  initialMacroState: MacroState,
  initialLevelState: LevelState,
  config: DateSimulationConfig
): DateSnapshot[] {
  const snapshots: DateSnapshot[] = [];

  let currentDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);

  // 초기 스냅샷
  const initialSnapshot = createInitialSnapshot(
    currentDate,
    initialMacroState,
    initialLevelState,
    config
  );
  snapshots.push(initialSnapshot);

  let previousSnapshot = initialSnapshot;

  // 날짜별로 시뮬레이션
  while (currentDate <= endDate) {
    // 다음 날짜로 이동
    currentDate = addDays(currentDate, config.intervalDays);

    if (currentDate > endDate) break;

    // 다음 스냅샷 생성
    const nextSnapshot = simulateNextPeriod(
      currentDate,
      previousSnapshot,
      config
    );

    snapshots.push(nextSnapshot);
    previousSnapshot = nextSnapshot;
  }

  return snapshots;
}

/**
 * 초기 스냅샷 생성
 */
function createInitialSnapshot(
  date: Date,
  macroState: MacroState,
  levelState: LevelState,
  config: DateSimulationConfig
): DateSnapshot {
  const entityValues = new Map<string, EntitySnapshot>();

  ALL_EXPANDED_ENTITIES.forEach((entity) => {
    const snapshot = createInitialEntitySnapshot(entity, macroState, levelState);
    entityValues.set(entity.id, snapshot);
  });

  return {
    date,
    timestamp: date.getTime(),
    description: `Initial state - ${formatDate(date)}`,
    macroState,
    levelState,
    entityValues,
    events: [],
  };
}

/**
 * 다음 기간 시뮬레이션
 */
function simulateNextPeriod(
  date: Date,
  previousSnapshot: DateSnapshot,
  config: DateSimulationConfig
): DateSnapshot {
  const entityValues = new Map<string, EntitySnapshot>();
  const events: SimulationEvent[] = [];

  // 각 엔티티의 다음 값 계산
  ALL_EXPANDED_ENTITIES.forEach((entity) => {
    const previousValue = previousSnapshot.entityValues.get(entity.id)!;
    const nextValue = evolveEntity(previousValue, config, date);

    entityValues.set(entity.id, nextValue);

    // 큰 변화가 있으면 이벤트 생성 (관련 엔티티 포함)
    if (Math.abs(nextValue.changeRate) > 0.1) {
      const relatedEntities = getRelatedEntities(entity.id);
      events.push({
        date,
        title: `${entity.name} ${nextValue.isGrowing ? 'surge' : 'decline'}`,
        description: `${nextValue.changeRate > 0 ? '+' : ''}${(nextValue.changeRate * 100).toFixed(1)}% change`,
        affectedEntities: [entity.id, ...relatedEntities],
        impact: nextValue.changeRate > 0 ? 'positive' : 'negative',
        magnitude: Math.abs(nextValue.changeRate),
      });
    }
  });

  // 매크로 상태도 약간씩 변화
  const newMacroState = evolveMacroState(previousSnapshot.macroState, config);

  return {
    date,
    timestamp: date.getTime(),
    description: `${formatDate(date)} - ${events.length} events`,
    macroState: newMacroState,
    levelState: previousSnapshot.levelState, // level state는 사용자가 조정
    entityValues,
    events,
  };
}

/**
 * 엔티티 초기 스냅샷 생성
 */
function createInitialEntitySnapshot(
  entity: Entity,
  macroState: MacroState,
  levelState: LevelState
): EntitySnapshot {
  // 엔티티 타입에 따라 초기값 설정
  let value = 50; // 기본값
  let revenue: number | undefined;
  let marketShare: number | undefined;
  let production: number | undefined;

  if (entity.type === 'COMPANY') {
    if (entity.id === 'company-nvidia') {
      value = 85;
      revenue = 60000;
      marketShare = levelState['nvidia_market_share'] || 85;
    } else if (entity.id === 'company-tsmc') {
      value = 80;
      revenue = 70000;
      marketShare = 55;
    } else if (entity.id === 'company-sk-hynix') {
      value = 70;
      revenue = 45000;
      marketShare = levelState['sk_hynix_hbm_share'] || 50;
    }
  } else if (entity.type === 'PRODUCT') {
    value = 60;
    production = levelState['gpu_demand_index'] || 100;
  } else if (entity.type === 'COMPONENT') {
    value = 55;
    production = levelState['hbm3e_supply_index'] || 100;
  }

  return {
    entityId: entity.id,
    entityName: entity.name,
    entityType: entity.type,
    value,
    revenue,
    marketShare,
    production,
    changeFromPrevious: 0,
    changeRate: 0,
    color: getEntityColor(value),
    size: getEntitySize(value),
    opacity: 1.0,
    isGrowing: true,
    volatility: 0.2,
  };
}

/**
 * 엔티티 진화 (한 기간 진행)
 */
function evolveEntity(
  previous: EntitySnapshot,
  config: DateSimulationConfig,
  date: Date
): EntitySnapshot {
  // 기본 성장률 (연간 → 일간)
  const dailyGrowthRate = config.growthRate / 365;
  const periodGrowthRate = dailyGrowthRate * config.intervalDays;

  // 랜덤 변동 추가
  const randomFactor = (Math.random() - 0.5) * 2 * config.randomness;
  const volatilityFactor = (Math.random() - 0.5) * previous.volatility;

  // 총 변화율
  const totalChangeRate = periodGrowthRate + randomFactor + volatilityFactor;

  // 새 값 계산
  const newValue = previous.value * (1 + totalChangeRate);
  const clampedValue = Math.max(10, Math.min(100, newValue)); // 10-100 범위로 제한

  const changeFromPrevious = clampedValue - previous.value;

  // 매출, 시장점유율 등도 변화
  const newRevenue = previous.revenue ? previous.revenue * (1 + totalChangeRate) : undefined;
  const newMarketShare = previous.marketShare ? previous.marketShare * (1 + totalChangeRate * 0.5) : undefined;
  const newProduction = previous.production ? previous.production * (1 + totalChangeRate) : undefined;

  return {
    ...previous,
    value: clampedValue,
    revenue: newRevenue,
    marketShare: newMarketShare,
    production: newProduction,
    changeFromPrevious,
    changeRate: totalChangeRate,
    color: getEntityColor(clampedValue),
    size: getEntitySize(clampedValue),
    isGrowing: totalChangeRate > 0,
    volatility: previous.volatility * 0.95 + Math.abs(totalChangeRate) * 0.05, // EMA
  };
}

/**
 * 매크로 상태 진화 - CASCADE EFFECTS
 *
 * 금리 → 대출 → M2 → 자산가격 흐름을 시뮬레이션
 */
function evolveMacroState(
  previous: MacroState,
  config: DateSimulationConfig
): MacroState {
  const newState = { ...previous };

  // 1. Fed Rate 변화 (중앙은행 정책)
  const fedRateChange = (Math.random() - 0.5) * 0.25; // ±0.25% 변화
  newState.fed_funds_rate = previous.fed_funds_rate || 5.25;
  newState.fed_funds_rate += fedRateChange;
  newState.fed_funds_rate = Math.max(0, Math.min(10, newState.fed_funds_rate));

  // 2. 금리 변화 → 대출 영향
  // 금리 상승 → 대출 감소, 금리 하락 → 대출 증가
  const loanImpact = -fedRateChange * 0.5; // 금리 1% 상승 시 대출 0.5% 감소

  // 3. 대출 변화 → M2 통화량 영향
  // 대출이 늘면 통화 공급 증가 (신용 창출)
  const m2 = newState.us_m2_money_supply || 21.4;
  const m2Change = loanImpact * 0.3; // 대출 1% 증가 → M2 0.3% 증가
  newState.us_m2_money_supply = Math.max(10, Math.min(40, m2 + m2Change));

  // 4. 금리 & M2 → GDP 영향
  // 금리 상승 & M2 감소 → GDP 하락
  const gdpImpact = (loanImpact * 0.4) - (fedRateChange * 0.2);
  newState.us_gdp_growth = previous.us_gdp_growth || 2.5;
  newState.us_gdp_growth += gdpImpact;
  newState.us_gdp_growth = Math.max(-5, Math.min(7, newState.us_gdp_growth));

  // 5. 금리 → 10Y Treasury Yield 영향
  // Fed Rate와 10Y Yield는 양의 상관관계
  const yieldChange = fedRateChange * 0.6 + (Math.random() - 0.5) * 0.1;
  newState.us_10y_yield = previous.us_10y_yield || 4.5;
  newState.us_10y_yield += yieldChange;
  newState.us_10y_yield = Math.max(0, Math.min(10, newState.us_10y_yield));

  // 6. 경제 불확실성 → VIX
  // GDP 하락, 금리 급변 → VIX 상승
  const uncertaintyFactor = Math.abs(fedRateChange) * 2 + Math.abs(gdpImpact) * 3;
  const vixChange = uncertaintyFactor * 5 + (Math.random() - 0.5) * 2;
  newState.vix = previous.vix || 18.5;
  newState.vix += vixChange;
  newState.vix = Math.max(5, Math.min(80, newState.vix));

  // 7. 통화량 & 경제 성장 → 인플레이션
  const inflationImpact = (m2Change * 0.3) + (gdpImpact * 0.2);
  newState.us_cpi_inflation = previous.us_cpi_inflation || 3.5;
  newState.us_cpi_inflation += inflationImpact;
  newState.us_cpi_inflation = Math.max(0, Math.min(10, newState.us_cpi_inflation));

  // 8. M2 변화 → 자산 가격 영향
  // M2 증가 → 자산 가격 상승 (liquidit

y)
  // 이는 stock prices, real estate 등에 영향을 미침
  const assetPriceImpact = m2Change * 0.5 - fedRateChange * 0.3;

  // Oil은 수요(GDP)와 달러 가치(M2)에 영향
  newState.wti_oil = previous.wti_oil || 85;
  const oilChange = gdpImpact * 2 + assetPriceImpact * 0.5 + (Math.random() - 0.5) * 5;
  newState.wti_oil += oilChange;
  newState.wti_oil = Math.max(20, Math.min(200, newState.wti_oil));

  return newState;
}

/**
 * 엔티티 값에 따른 색상
 */
function getEntityColor(value: number): string {
  if (value >= 80) return '#00FF9F'; // 초록 (강함)
  if (value >= 60) return '#4ADE80'; // 연한 초록
  if (value >= 40) return '#94A3B8'; // 회색 (중립)
  if (value >= 20) return '#FB923C'; // 주황
  return '#EF4444'; // 빨강 (약함)
}

/**
 * 엔티티 값에 따른 크기
 */
function getEntitySize(value: number): number {
  return 0.5 + (value / 100) * 1.5; // 0.5 ~ 2.0
}

/**
 * 관련 엔티티 찾기 (supply chain & business relationships)
 */
function getRelatedEntities(entityId: string): string[] {
  // Define supply chain and business relationships
  const relationships: Record<string, string[]> = {
    // NVIDIA affects suppliers and customers
    'company-nvidia': [
      'company-tsmc',
      'company-sk-hynix',
      'component-hbm3e',
      'product-h100',
      'customer-microsoft',
      'customer-meta',
      'customer-google',
    ],

    // TSMC affects customers and products
    'company-tsmc': [
      'company-nvidia',
      'company-apple',
      'product-h100',
      'component-cowos',
    ],

    // SK Hynix affects memory products and customers
    'company-sk-hynix': [
      'company-nvidia',
      'component-hbm3e',
      'component-hbm2e',
      'product-h100',
    ],

    // Samsung affects memory and semiconductor industry
    'company-samsung': [
      'component-hbm3e',
      'product-smartphone',
      'company-tsmc',
    ],

    // H100 product affects supply chain
    'product-h100': [
      'company-nvidia',
      'component-hbm3e',
      'component-cowos',
      'customer-microsoft',
      'customer-google',
    ],

    // HBM3E component affects GPU products
    'component-hbm3e': [
      'company-sk-hynix',
      'company-samsung',
      'product-h100',
      'product-a100',
    ],

    // Hyperscalers affect GPU demand
    'customer-microsoft': ['product-h100', 'company-nvidia'],
    'customer-google': ['product-h100', 'product-tpu-v5', 'company-nvidia'],
    'customer-meta': ['product-h100', 'company-nvidia'],
    'customer-amazon': ['product-h100', 'product-aws-trainium', 'company-nvidia'],

    // Apple affects suppliers
    'company-apple': ['company-tsmc', 'product-smartphone', 'company-sk-hynix'],
  };

  return relationships[entityId] || [];
}

/**
 * 날짜 포맷
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * 날짜에 일수 추가
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 두 스냅샷 사이를 보간 (애니메이션용)
 */
export function interpolateSnapshots(
  snapshot1: DateSnapshot,
  snapshot2: DateSnapshot,
  progress: number // 0.0 ~ 1.0
): DateSnapshot {
  const interpolatedValues = new Map<string, EntitySnapshot>();

  snapshot1.entityValues.forEach((value1, entityId) => {
    const value2 = snapshot2.entityValues.get(entityId);
    if (!value2) {
      interpolatedValues.set(entityId, value1);
      return;
    }

    // 값들을 보간
    interpolatedValues.set(entityId, {
      ...value1,
      value: value1.value + (value2.value - value1.value) * progress,
      revenue: value1.revenue && value2.revenue
        ? value1.revenue + (value2.revenue - value1.revenue) * progress
        : value1.revenue,
      marketShare: value1.marketShare && value2.marketShare
        ? value1.marketShare + (value2.marketShare - value1.marketShare) * progress
        : value1.marketShare,
      production: value1.production && value2.production
        ? value1.production + (value2.production - value1.production) * progress
        : value1.production,
      changeRate: value1.changeRate + (value2.changeRate - value1.changeRate) * progress,
      color: progress < 0.5 ? value1.color : value2.color,
      size: value1.size + (value2.size - value1.size) * progress,
    });
  });

  // 날짜도 보간
  const interpolatedTimestamp = snapshot1.timestamp + (snapshot2.timestamp - snapshot1.timestamp) * progress;
  const interpolatedDate = new Date(interpolatedTimestamp);

  return {
    date: interpolatedDate,
    timestamp: interpolatedTimestamp,
    description: `${formatDate(interpolatedDate)} (interpolated)`,
    macroState: snapshot1.macroState, // 매크로는 보간 안함
    levelState: snapshot1.levelState,
    entityValues: interpolatedValues,
    events: progress < 0.5 ? snapshot1.events : snapshot2.events,
  };
}

/**
 * 특정 날짜의 스냅샷 찾기
 */
export function findSnapshotByDate(
  snapshots: DateSnapshot[],
  targetDate: Date
): DateSnapshot | null {
  const targetTimestamp = targetDate.getTime();

  // 가장 가까운 스냅샷 찾기
  let closest = snapshots[0];
  let minDiff = Math.abs(snapshots[0].timestamp - targetTimestamp);

  for (const snapshot of snapshots) {
    const diff = Math.abs(snapshot.timestamp - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = snapshot;
    }
  }

  return closest;
}
