/**
 * NVIDIA AI Supply Chain - Real World Data
 *
 * Comprehensive supply chain mapping with actual companies, products, and metrics
 * Data sources: Company filings, industry reports, market research (2024)
 */

/**
 * Supply Chain Entity
 */
export interface SupplyChainEntity {
  id: string;
  name: string;
  type: 'company' | 'product' | 'component' | 'customer' | 'service';
  ticker?: string;
  country: string;
  sector: string;

  // Financial metrics (in millions USD, annual)
  revenue?: number;
  marketCap?: number;
  operatingMargin?: number; // %

  // Supply chain metrics
  marketShare?: number; // % in relevant market
  productionCapacity?: number; // Units per year or wafers per month
  leadTime?: number; // Days
  dependencyScore?: number; // 0-100, how critical to NVIDIA

  // Real-world data points
  description: string;
  keyProducts?: string[];
  majorCustomers?: string[];
}

/**
 * Supply Chain Relationship
 */
export interface SupplyChainLink {
  from: string; // Entity ID
  to: string; // Entity ID
  type: 'supplier' | 'customer' | 'partner' | 'competitor';
  strength: number; // 0-1, relationship strength

  // Quantitative metrics
  annualValue?: number; // Transaction value in millions USD
  volume?: number; // Units per year
  criticality: 'critical' | 'important' | 'moderate' | 'optional';

  description: string;
}

/**
 * NVIDIA Core Company
 */
export const NVIDIA: SupplyChainEntity = {
  id: 'nvidia',
  name: 'NVIDIA Corporation',
  type: 'company',
  ticker: 'NVDA',
  country: 'USA',
  sector: 'Semiconductors',
  revenue: 60922, // FY2024
  marketCap: 3000000, // ~$3T (2024)
  operatingMargin: 62, // Industry-leading margins
  marketShare: 95, // AI GPU market share
  dependencyScore: 100,
  description: 'Leader in AI computing, GPUs, and accelerated computing. Designs chips, licenses IP, provides CUDA software ecosystem.',
  keyProducts: ['H100', 'A100', 'GH200', 'B100 (upcoming)', 'Blackwell', 'CUDA'],
  majorCustomers: ['Microsoft', 'Meta', 'Google', 'Amazon', 'Tesla', 'Oracle'],
};

/**
 * Key Suppliers
 */

// TSMC - Foundry (Manufacturing)
export const TSMC: SupplyChainEntity = {
  id: 'tsmc',
  name: 'Taiwan Semiconductor Manufacturing Company',
  type: 'company',
  ticker: 'TSM',
  country: 'Taiwan',
  sector: 'Semiconductors',
  revenue: 69300, // 2023
  marketCap: 590000,
  operatingMargin: 45,
  marketShare: 60, // Global foundry market
  productionCapacity: 14000000, // wafer starts per month (300mm equivalent)
  leadTime: 90, // Days for leading-edge chips
  dependencyScore: 95, // NVIDIA highly dependent
  description: 'World\'s largest contract chip manufacturer. Produces NVIDIA\'s H100, A100 on 4nm/5nm nodes. CoWoS advanced packaging.',
  keyProducts: ['4nm process', '5nm process', '3nm process', 'CoWoS packaging', 'InFO packaging'],
  majorCustomers: ['Apple', 'NVIDIA', 'AMD', 'Qualcomm', 'MediaTek'],
};

// SK Hynix - HBM Memory
export const SK_HYNIX: SupplyChainEntity = {
  id: 'sk-hynix',
  name: 'SK Hynix',
  type: 'company',
  ticker: '000660.KS',
  country: 'South Korea',
  sector: 'Memory Semiconductors',
  revenue: 36700, // 2023
  marketCap: 85000,
  operatingMargin: 8, // Cyclical
  marketShare: 50, // HBM3E market share (leading)
  productionCapacity: 200000, // HBM stacks per month
  leadTime: 60,
  dependencyScore: 90,
  description: 'Leading HBM (High Bandwidth Memory) supplier. Exclusive HBM3E 12-hi stack supplier for H100. Critical for AI GPU performance.',
  keyProducts: ['HBM3E 24GB', 'HBM3 16GB', 'HBM2E', 'DDR5', 'GDDR6'],
  majorCustomers: ['NVIDIA', 'AMD', 'Intel'],
};

// Samsung - HBM Memory (Secondary)
export const SAMSUNG: SupplyChainEntity = {
  id: 'samsung',
  name: 'Samsung Electronics',
  type: 'company',
  ticker: '005930.KS',
  country: 'South Korea',
  sector: 'Electronics & Semiconductors',
  revenue: 234000, // Total company
  marketCap: 320000,
  operatingMargin: 12,
  marketShare: 30, // HBM market share (growing)
  productionCapacity: 150000, // HBM stacks per month
  leadTime: 75,
  dependencyScore: 50, // NVIDIA diversifying to Samsung
  description: 'World\'s largest memory chip maker. Competing with SK Hynix in HBM3E. Recently qualified for NVIDIA supply chain (2024).',
  keyProducts: ['HBM3E', 'HBM3', 'GDDR6', 'DDR5', 'NAND Flash'],
  majorCustomers: ['NVIDIA (growing)', 'AMD', 'Qualcomm', 'Apple'],
};

// Micron - Memory (Emerging HBM player)
export const MICRON: SupplyChainEntity = {
  id: 'micron',
  name: 'Micron Technology',
  type: 'company',
  ticker: 'MU',
  country: 'USA',
  sector: 'Memory Semiconductors',
  revenue: 15537, // FY2023
  marketCap: 95000,
  operatingMargin: -10, // Cyclical downturn
  marketShare: 15, // HBM market (entering)
  productionCapacity: 80000, // HBM capacity ramping
  leadTime: 90,
  dependencyScore: 30,
  description: 'US memory leader entering HBM market. Lower market share but strategic US supplier for NVIDIA amidst geopolitical concerns.',
  keyProducts: ['HBM3E (ramping)', 'GDDR6X', 'DDR5', 'NAND'],
  majorCustomers: ['NVIDIA (ramping)', 'Intel', 'AMD'],
};

/**
 * Key Products
 */

// H100 GPU
export const H100_GPU: SupplyChainEntity = {
  id: 'h100',
  name: 'NVIDIA H100 Tensor Core GPU',
  type: 'product',
  country: 'USA',
  sector: 'AI Accelerators',
  revenue: 25000, // Estimated H100 revenue
  productionCapacity: 2000000, // Units per year (estimated)
  marketShare: 90, // AI training market
  dependencyScore: 100,
  description: 'NVIDIA\'s flagship AI training GPU. 80GB HBM3 memory, 4nm process. Selling for $25,000-40,000 per unit. Extreme demand from cloud providers.',
  keyProducts: ['H100 SXM5 80GB', 'H100 PCIe', 'H100 NVL'],
};

// HBM3E Memory
export const HBM3E: SupplyChainEntity = {
  id: 'hbm3e',
  name: 'HBM3E Memory',
  type: 'component',
  country: 'South Korea',
  sector: 'Memory',
  marketShare: 100, // Newest generation
  productionCapacity: 400000, // Stacks per month (industry total)
  leadTime: 60,
  dependencyScore: 95,
  description: 'High Bandwidth Memory 3E - 5th gen HBM. 1.2 TB/s bandwidth per stack. 12-hi stacks. Critical bottleneck for H100 production.',
  keyProducts: ['24GB stacks', '16GB stacks', '12-hi configuration'],
};

// CoWoS Packaging
export const COWOS: SupplyChainEntity = {
  id: 'cowos',
  name: 'CoWoS Advanced Packaging',
  type: 'component',
  country: 'Taiwan',
  sector: 'Semiconductor Packaging',
  productionCapacity: 25000, // Wafers per month
  leadTime: 45,
  dependencyScore: 90,
  description: 'Chip on Wafer on Substrate. TSMC\'s advanced packaging technology. Enables integration of GPU die + HBM stacks. Major bottleneck.',
  keyProducts: ['CoWoS-S', 'CoWoS-L', 'CoWoS-R'],
};

/**
 * Major Customers (Cloud Hyperscalers)
 */

// Microsoft
export const MICROSOFT: SupplyChainEntity = {
  id: 'microsoft',
  name: 'Microsoft Corporation',
  type: 'customer',
  ticker: 'MSFT',
  country: 'USA',
  sector: 'Cloud Computing',
  revenue: 211000, // FY2023
  marketCap: 3100000,
  dependencyScore: 85,
  description: 'Azure AI infrastructure. Deploying 100,000+ H100 GPUs. Partnership with OpenAI (GPT-4, ChatGPT). Largest NVIDIA customer.',
  keyProducts: ['Azure AI', 'Copilot', 'OpenAI Partnership'],
};

// Meta
export const META: SupplyChainEntity = {
  id: 'meta',
  name: 'Meta Platforms',
  type: 'customer',
  ticker: 'META',
  country: 'USA',
  sector: 'Social Media & AI',
  revenue: 134900, // 2023
  marketCap: 1300000,
  dependencyScore: 80,
  description: 'Building LLaMA models and metaverse infrastructure. Ordering 350,000 H100 GPUs. Largest single order in 2024.',
  keyProducts: ['LLaMA 3', 'Meta AI', 'Reality Labs'],
};

// Google
export const GOOGLE: SupplyChainEntity = {
  id: 'google',
  name: 'Google (Alphabet)',
  type: 'customer',
  ticker: 'GOOGL',
  country: 'USA',
  sector: 'Cloud & AI',
  revenue: 307400, // 2023
  marketCap: 2000000,
  dependencyScore: 60, // Has TPUs as alternative
  description: 'Google Cloud AI, Gemini models. Uses NVIDIA GPUs + in-house TPUs. Dual-sourcing strategy reduces dependency.',
  keyProducts: ['Gemini', 'Google Cloud AI', 'TPU v5'],
};

// Amazon
export const AMAZON: SupplyChainEntity = {
  id: 'amazon',
  name: 'Amazon Web Services',
  type: 'customer',
  ticker: 'AMZN',
  country: 'USA',
  sector: 'Cloud Computing',
  revenue: 90800, // AWS revenue 2023
  marketCap: 1800000,
  dependencyScore: 65, // Has Trainium/Inferentia
  description: 'AWS EC2 P5 instances with H100. Also developing in-house Trainium/Inferentia chips. Hedging NVIDIA dependency.',
  keyProducts: ['EC2 P5', 'Trainium', 'Inferentia', 'SageMaker'],
};

/**
 * Alternative/Competitive Suppliers
 */

// AMD
export const AMD: SupplyChainEntity = {
  id: 'amd',
  name: 'Advanced Micro Devices',
  type: 'company',
  ticker: 'AMD',
  country: 'USA',
  sector: 'Semiconductors',
  revenue: 22700, // 2023
  marketCap: 280000,
  marketShare: 5, // AI GPU market share
  dependencyScore: 0,
  description: 'NVIDIA competitor with MI300X AI accelerator. Uses TSMC 5nm + Samsung HBM3. Lower market share but growing.',
  keyProducts: ['MI300X', 'MI250X', 'ROCm software', 'CDNA architecture'],
  majorCustomers: ['Microsoft', 'Oracle', 'Meta'],
};

// Intel
export const INTEL: SupplyChainEntity = {
  id: 'intel',
  name: 'Intel Corporation',
  type: 'company',
  ticker: 'INTC',
  country: 'USA',
  sector: 'Semiconductors',
  revenue: 54200, // 2023
  marketCap: 185000,
  marketShare: 1, // AI GPU market share (minimal)
  dependencyScore: 0,
  description: 'Entering AI GPU market with Gaudi accelerators. Also builds GPUs (Ponte Vecchio). Limited traction against NVIDIA.',
  keyProducts: ['Gaudi 2', 'Gaudi 3', 'Ponte Vecchio', 'oneAPI'],
};

/**
 * Supply Chain Links
 */

export const SUPPLY_CHAIN_LINKS: SupplyChainLink[] = [
  // TSMC → NVIDIA (Critical manufacturing)
  {
    from: 'tsmc',
    to: 'nvidia',
    type: 'supplier',
    strength: 0.95,
    annualValue: 11000, // Estimated $11B annual wafer purchases
    criticality: 'critical',
    description: 'TSMC manufactures all H100/A100 GPUs on 4nm/5nm process. CoWoS packaging also done by TSMC. Single source dependency.',
  },

  // SK Hynix → NVIDIA (Critical HBM supply)
  {
    from: 'sk-hynix',
    to: 'nvidia',
    type: 'supplier',
    strength: 0.90,
    annualValue: 6000, // Estimated $6B HBM purchases
    volume: 8000000, // HBM stacks per year
    criticality: 'critical',
    description: 'SK Hynix supplies 50%+ of NVIDIA\'s HBM3E. Exclusive 12-hi stack supplier. Multi-year supply agreements.',
  },

  // Samsung → NVIDIA (Growing HBM supply)
  {
    from: 'samsung',
    to: 'nvidia',
    type: 'supplier',
    strength: 0.70,
    annualValue: 3000, // Growing to $3B
    volume: 4000000,
    criticality: 'important',
    description: 'Samsung qualified as HBM3E supplier in 2024. NVIDIA diversifying away from SK Hynix monopoly. Capacity ramping.',
  },

  // Micron → NVIDIA (Emerging supplier)
  {
    from: 'micron',
    to: 'nvidia',
    type: 'supplier',
    strength: 0.50,
    annualValue: 500, // Small but growing
    volume: 500000,
    criticality: 'moderate',
    description: 'Micron ramping HBM3E production. Strategic US supplier for geopolitical diversification. Lower volumes currently.',
  },

  // HBM3E → H100 (Component integration)
  {
    from: 'hbm3e',
    to: 'h100',
    type: 'supplier',
    strength: 1.0,
    criticality: 'critical',
    description: 'Each H100 requires 5-6 HBM3E stacks (80GB config). HBM3E is the primary bottleneck for H100 production.',
  },

  // CoWoS → H100 (Packaging)
  {
    from: 'cowos',
    to: 'h100',
    type: 'supplier',
    strength: 1.0,
    criticality: 'critical',
    description: 'CoWoS advanced packaging integrates GPU die with HBM stacks. TSMC CoWoS capacity is major constraint.',
  },

  // NVIDIA → Microsoft (Largest customer)
  {
    from: 'nvidia',
    to: 'microsoft',
    type: 'customer',
    strength: 0.90,
    annualValue: 10000, // Estimated $10B+ annual purchases
    volume: 100000, // H100 units
    criticality: 'critical',
    description: 'Microsoft Azure deploying massive H100 clusters for OpenAI (GPT-4). Largest NVIDIA enterprise customer.',
  },

  // NVIDIA → Meta
  {
    from: 'nvidia',
    to: 'meta',
    type: 'customer',
    strength: 0.85,
    annualValue: 9000,
    volume: 350000, // Announced order
    criticality: 'critical',
    description: 'Meta ordered 350,000 H100 GPUs in 2024 for LLaMA training. Largest single order. Multi-year deployment.',
  },

  // NVIDIA → Google
  {
    from: 'nvidia',
    to: 'google',
    type: 'customer',
    strength: 0.70,
    annualValue: 4000,
    volume: 50000,
    criticality: 'important',
    description: 'Google Cloud uses H100 for Gemini, but also has in-house TPU v5. Dual-sourcing strategy.',
  },

  // NVIDIA → Amazon
  {
    from: 'nvidia',
    to: 'amazon',
    type: 'customer',
    strength: 0.70,
    annualValue: 3500,
    volume: 40000,
    criticality: 'important',
    description: 'AWS P5 instances powered by H100. Amazon also developing Trainium/Inferentia to reduce NVIDIA dependency.',
  },

  // AMD competitive relationship
  {
    from: 'amd',
    to: 'nvidia',
    type: 'competitor',
    strength: 0.30,
    criticality: 'moderate',
    description: 'AMD MI300X competes with H100 but has <5% market share. ROCm software ecosystem weaker than CUDA.',
  },

  // Intel competitive relationship
  {
    from: 'intel',
    to: 'nvidia',
    type: 'competitor',
    strength: 0.15,
    criticality: 'optional',
    description: 'Intel Gaudi competes in AI inference. Minimal market share. oneAPI lacks CUDA\'s ecosystem advantage.',
  },
];

/**
 * All entities combined
 */
export const ALL_SUPPLY_CHAIN_ENTITIES: SupplyChainEntity[] = [
  NVIDIA,
  TSMC,
  SK_HYNIX,
  SAMSUNG,
  MICRON,
  H100_GPU,
  HBM3E,
  COWOS,
  MICROSOFT,
  META,
  GOOGLE,
  AMAZON,
  AMD,
  INTEL,
];

/**
 * Supply Chain Bottlenecks (2024)
 */
export const SUPPLY_CHAIN_BOTTLENECKS = [
  {
    component: 'HBM3E Memory',
    severity: 'Critical',
    impact: 'Limits H100 production to ~2M units/year',
    suppliers: ['SK Hynix (50%)', 'Samsung (30%)', 'Micron (15%)'],
    leadTime: 6, // months
    description: 'HBM3E supply is THE bottleneck. Each H100 needs 5-6 stacks. Industry capacity ~400k stacks/month = 2.4M GPUs/year theoretical max.',
  },
  {
    component: 'CoWoS Packaging',
    severity: 'Critical',
    impact: 'TSMC CoWoS capacity at 25k wafers/month',
    suppliers: ['TSMC (100%)'],
    leadTime: 3, // months
    description: 'Advanced packaging required to bond GPU die + HBM. TSMC expanding capacity but takes 12-18 months. Single source risk.',
  },
  {
    component: '4nm Wafer Capacity',
    severity: 'High',
    impact: 'Limited 4nm allocation',
    suppliers: ['TSMC (100%)'],
    leadTime: 4,
    description: 'TSMC 4nm used for H100. Apple, AMD also competing for capacity. NVIDIA has priority allocation but not unlimited.',
  },
];

/**
 * Market Dynamics (2024)
 */
export const MARKET_DYNAMICS = {
  h100Price: 30000, // Average selling price (USD)
  h100Demand: 4000000, // Annual demand (units)
  h100Supply: 2000000, // Annual supply (units)
  supplyGap: -2000000, // Shortage
  leadTimes: {
    order_to_delivery: 52, // weeks
    allocation_wait: 26, // weeks for new customers
  },
  marketSize: {
    ai_chip_market_2024: 50000, // Million USD
    ai_chip_market_2027: 200000, // Million USD (projected)
    cagr: 58, // % annual growth
  },
  pricing: {
    h100_list_price: 30000,
    h100_gray_market: 45000, // Unofficial resale price
    premium_vs_list: 50, // %
  },
};

/**
 * Geopolitical Risks
 */
export const GEOPOLITICAL_RISKS = [
  {
    risk: 'Taiwan Conflict',
    impact: 'Catastrophic',
    probability: 'Low-Medium',
    description: 'TSMC produces 100% of leading-edge chips. Any Taiwan strait crisis would halt all H100 production.',
    mitigation: 'TSMC building fabs in Arizona ($40B investment), but not until 2025-2026.',
  },
  {
    risk: 'US-China Export Controls',
    impact: 'High',
    probability: 'High',
    description: 'US already restricts H100 exports to China. China is 20-25% of semiconductor market.',
    mitigation: 'NVIDIA created H800 (downgraded H100) for China, but further restrictions possible.',
  },
  {
    risk: 'South Korea Tensions',
    impact: 'High',
    probability: 'Low',
    description: 'SK Hynix and Samsung supply 80%+ of HBM. Korean peninsula tensions could disrupt supply.',
    mitigation: 'Micron (US) ramping HBM production. Samsung has fabs in Austin, TX.',
  },
];

/**
 * Calculate Supply Chain Health Score
 */
export function calculateSupplyChainHealth(
  hbmAvailability: number, // 0-1
  cowosCapacity: number, // 0-1
  waferAllocation: number, // 0-1
  geopoliticalStability: number // 0-1
): {
  score: number;
  status: 'Healthy' | 'Constrained' | 'Critical' | 'Crisis';
  bottleneck: string;
} {
  const weights = {
    hbm: 0.40,
    cowos: 0.30,
    wafer: 0.20,
    geopolitical: 0.10,
  };

  const score =
    hbmAvailability * weights.hbm +
    cowosCapacity * weights.cowos +
    waferAllocation * weights.wafer +
    geopoliticalStability * weights.geopolitical;

  let status: 'Healthy' | 'Constrained' | 'Critical' | 'Crisis';
  if (score >= 0.8) status = 'Healthy';
  else if (score >= 0.6) status = 'Constrained';
  else if (score >= 0.4) status = 'Critical';
  else status = 'Crisis';

  // Identify primary bottleneck
  const factors = [
    { name: 'HBM3E Supply', value: hbmAvailability },
    { name: 'CoWoS Packaging', value: cowosCapacity },
    { name: 'Wafer Allocation', value: waferAllocation },
    { name: 'Geopolitical', value: geopoliticalStability },
  ];

  const bottleneck = factors.reduce((min, f) => (f.value < min.value ? f : min)).name;

  return { score, status, bottleneck };
}
