/**
 * Company Data Repository
 *
 * 현재: 6개 기업
 * 목표: 50+ 기업
 *
 * 섹터별 분포:
 * - Banking: 3개 → 목표 10개
 * - Real Estate: 3개 → 목표 15개
 * - Manufacturing: 0개 → 목표 10개
 * - Semiconductor: 0개 → 목표 10개
 * - Options: 0개 → 목표 5개
 */

export type Sector = 'BANKING' | 'REALESTATE' | 'MANUFACTURING' | 'SEMICONDUCTOR' | 'OPTIONS' | 'CRYPTO' | 'COMMODITIES';

export type Topic = 'supply-chain' | 'hedge-fund' | 'real-estate' | 'commodities' | 'crypto' | 'all';

export interface Company {
  id: string;
  ticker: string;
  name: string;
  name_en?: string;
  sector: Sector;
  country: string;
  topics?: Topic[]; // 🔍 Topics for filtering (supply-chain, hedge-fund, real-estate, etc.)

  // Financial data
  financials: {
    revenue: number;           // 매출 (억원 or 백만달러)
    net_income: number;        // 순이익
    total_assets: number;      // 총자산
    total_debt: number;        // 총부채
    equity: number;            // 자본
    ebitda?: number;           // EBITDA
    operating_income?: number; // 영업이익
  };

  // Key ratios
  ratios: {
    icr: number;              // Interest Coverage Ratio
    de_ratio: number;         // Debt-to-Equity
    roe?: number;             // Return on Equity
    roa?: number;             // Return on Assets
    current_ratio?: number;   // 유동비율
    pe_ratio?: number;        // Price-to-Earnings Ratio
  };

  // Sector-specific metrics
  sector_metrics?: {
    // Banking
    nim?: number;                    // Net Interest Margin
    provision_rate?: number;         // 대손충당금 비율

    // Real Estate
    ltv?: number;                    // Loan-to-Value
    occupancy_rate?: number;         // 임대율
    rental_yield?: number;           // 임대수익률

    // Manufacturing
    capacity_utilization?: number;   // 가동률
    labor_cost_ratio?: number;       // 인건비 비율

    // Semiconductor
    wafer_utilization?: number;      // 웨이퍼 가동률
    rd_intensity?: number;           // R&D 집약도
    asp_change?: number;             // ASP 변화율
    capex_ratio?: number;            // CapEx 비율

    // Options
    delta?: number;
    gamma?: number;
    vega?: number;
    theta?: number;

    // Commodities
    production_volume?: number;      // Annual production (MT, barrels, oz, etc.)
    reserves?: number;                // Proven reserves (years at current production)
    price_sensitivity?: number;       // Beta to commodity price
    extraction_cost?: number;         // Cost per unit ($/oz, $/barrel, $/MT)
    capacity_mta?: number;            // Production capacity (Million Tonnes per Annum)
  };

  // Location (for globe visualization)
  location?: {
    lat: number;
    lng: number;
  };
}

export interface CompanyLink {
  source: string;
  target: string;
  amount: number;
  type: 'LENDING' | 'INVESTMENT' | 'SUPPLY_CHAIN' | 'OWNERSHIP';
}

// ========================================
// BANKING SECTOR (7/10 companies)
// ========================================

export const BANKING_COMPANIES: Company[] = [
  {
    id: 'SH_BANK',
    ticker: 'SHB',
    name: '신한은행',
    name_en: 'Shinhan Bank',
    sector: 'BANKING',
    country: 'KR',
    financials: {
      revenue: 150000,        // 15조원
      net_income: 2520,       // 2,520억원
      total_assets: 450000,   // 450조원
      total_debt: 350000,     // 350조원
      equity: 100000,         // 100조원
      operating_income: 5000, // 5,000억원
    },
    ratios: {
      icr: 5.5,
      de_ratio: 3.5,
      roe: 10.2,
      roa: 0.56,
    },
    sector_metrics: {
      nim: 1.85,              // 1.85% NIM
      provision_rate: 0.45,   // 0.45% 대손충당금
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'KB_BANK',
    ticker: 'KBF',
    name: 'KB금융',
    name_en: 'KB Financial Group',
    sector: 'BANKING',
    country: 'KR',
    financials: {
      revenue: 130000,
      net_income: 2200,
      total_assets: 400000,
      total_debt: 320000,
      equity: 80000,
      operating_income: 4500,
    },
    ratios: {
      icr: 4.8,
      de_ratio: 4.0,
      roe: 9.5,
      roa: 0.55,
    },
    sector_metrics: {
      nim: 1.72,
      provision_rate: 0.50,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'WR_BANK',
    name: '우리은행',
    name_en: 'Woori Bank',
    sector: 'BANKING',
    ticker: 'WRB',
    country: 'KR',
    financials: {
      revenue: 100000,
      net_income: 1800,
      total_assets: 300000,
      total_debt: 280000,
      equity: 20000,
      operating_income: 3800,
    },
    ratios: {
      icr: 6.2,
      de_ratio: 14.0,
      roe: 9.0,
      roa: 0.60,
    },
    sector_metrics: {
      nim: 1.90,
      provision_rate: 0.40,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'HANA_BANK',
    name: '하나은행',
    name_en: 'Hana Bank',
    sector: 'BANKING',
    ticker: 'HNB',
    country: 'KR',
    financials: {
      revenue: 120000,
      net_income: 2000,
      total_assets: 380000,
      total_debt: 300000,
      equity: 80000,
      operating_income: 4000,
    },
    ratios: {
      icr: 5.0,
      de_ratio: 3.75,
      roe: 2.5,
      roa: 0.53,
    },
    sector_metrics: {
      nim: 1.68,
      provision_rate: 0.55,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'JPM_CHASE',
    name: 'JP모건체이스',
    name_en: 'JPMorgan Chase & Co.',
    sector: 'BANKING',
    ticker: 'JPM',
    country: 'US',
    financials: {
      revenue: 162400,        // $162.4B (2023)
      net_income: 49550,      // $49.55B
      total_assets: 3875000,  // $3.875T
      total_debt: 320000,     // $320B
      equity: 319000,         // $319B
      operating_income: 65000,
    },
    ratios: {
      icr: 8.5,
      de_ratio: 1.0,
      roe: 15.5,
      roa: 1.28,
    },
    sector_metrics: {
      nim: 2.25,
      provision_rate: 0.35,
    },
    location: {
      lat: 40.7580,
      lng: -73.9855,
    },
  },
  {
    id: 'BANK_OF_AMERICA',
    name: '뱅크오브아메리카',
    name_en: 'Bank of America Corporation',
    sector: 'BANKING',
    ticker: 'BAC',
    country: 'US',
    financials: {
      revenue: 115000,        // $115B (2023)
      net_income: 26500,      // $26.5B
      total_assets: 3051000,  // $3.051T
      total_debt: 280000,     // $280B
      equity: 276000,         // $276B
      operating_income: 38000,
    },
    ratios: {
      icr: 7.5,
      de_ratio: 1.01,
      roe: 9.6,
      roa: 0.87,
    },
    sector_metrics: {
      nim: 2.10,
      provision_rate: 0.40,
    },
    location: {
      lat: 35.2271,
      lng: -80.8431,
    },
  },
  {
    id: 'HSBC',
    name: 'HSBC',
    name_en: 'HSBC Holdings plc',
    sector: 'BANKING',
    ticker: 'HSBC',
    country: 'UK',
    financials: {
      revenue: 65500,         // £65.5B (~$82B) (2023)
      net_income: 24200,      // £24.2B (~$30B)
      total_assets: 2985000,  // £2.985T (~$3.7T)
      total_debt: 250000,     // ~$312B
      equity: 198000,         // ~$247B
      operating_income: 32000,
    },
    ratios: {
      icr: 6.8,
      de_ratio: 1.26,
      roe: 12.2,
      roa: 0.81,
    },
    sector_metrics: {
      nim: 1.95,
      provision_rate: 0.38,
    },
    location: {
      lat: 51.5074,
      lng: -0.1278,
    },
  },
  {
    id: 'IBK',
    name: '기업은행',
    name_en: 'Industrial Bank of Korea',
    sector: 'BANKING',
    ticker: 'IBK',
    country: 'KR',
    financials: {
      revenue: 90000,
      net_income: 1500,
      total_assets: 320000,
      total_debt: 280000,
      equity: 40000,
      operating_income: 3500,
    },
    ratios: {
      icr: 4.3,
      de_ratio: 7.0,
      roe: 3.75,
      roa: 0.47,
    },
    sector_metrics: {
      nim: 1.55,
      provision_rate: 0.60,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
];

// ========================================
// REAL ESTATE SECTOR (7/15 companies)
// ========================================

export const REALESTATE_COMPANIES: Company[] = [
  {
    id: 'SH_REIT',
    name: '신한알파리츠',
    name_en: 'Shinhan Alpha REIT',
    sector: 'REALESTATE',
    ticker: 'SHRE',
    country: 'KR',
    financials: {
      revenue: 50,
      net_income: 4.48,
      total_assets: 580,
      total_debt: 290,
      equity: 290,
    },
    ratios: {
      icr: 1.83,
      de_ratio: 1.0,
      roe: 1.54,
      roa: 0.77,
    },
    sector_metrics: {
      ltv: 50.0,
      occupancy_rate: 92.5,
      rental_yield: 5.2,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'IR_REIT',
    name: '이리츠코크렙',
    name_en: 'iREITS KOREF',
    sector: 'REALESTATE',
    ticker: 'IRRE',
    country: 'KR',
    financials: {
      revenue: 40,
      net_income: 1.88,
      total_assets: 400,
      total_debt: 250,
      equity: 150,
    },
    ratios: {
      icr: 0.80,
      de_ratio: 1.67,
      roe: 1.25,
      roa: 0.47,
    },
    sector_metrics: {
      ltv: 62.5,
      occupancy_rate: 85.0,
      rental_yield: 4.7,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'NH_REIT',
    name: 'NH프라임리츠',
    name_en: 'NH Prime REIT',
    sector: 'REALESTATE',
    ticker: 'NHRE',
    country: 'KR',
    financials: {
      revenue: 45,
      net_income: 7.52,
      total_assets: 300,
      total_debt: 75,
      equity: 225,
    },
    ratios: {
      icr: 4.26,
      de_ratio: 0.33,
      roe: 3.34,
      roa: 2.51,
    },
    sector_metrics: {
      ltv: 25.0,
      occupancy_rate: 97.0,
      rental_yield: 5.8,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'LOTTE_REIT',
    name: '롯데리츠',
    name_en: 'Lotte REIT',
    sector: 'REALESTATE',
    ticker: 'LORE',
    country: 'KR',
    financials: {
      revenue: 55,
      net_income: 6.5,
      total_assets: 650,
      total_debt: 320,
      equity: 330,
    },
    ratios: {
      icr: 2.8,
      de_ratio: 0.97,
      roe: 1.97,
      roa: 1.0,
    },
    sector_metrics: {
      ltv: 49.2,
      occupancy_rate: 94.0,
      rental_yield: 5.5,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'KOCREF_REIT',
    name: '코람코에너지플러스리츠',
    name_en: 'Koramco Energy Plus REIT',
    sector: 'REALESTATE',
    ticker: 'KORE',
    country: 'KR',
    financials: {
      revenue: 38,
      net_income: 5.2,
      total_assets: 420,
      total_debt: 180,
      equity: 240,
    },
    ratios: {
      icr: 3.5,
      de_ratio: 0.75,
      roe: 2.17,
      roa: 1.24,
    },
    sector_metrics: {
      ltv: 42.9,
      occupancy_rate: 96.5,
      rental_yield: 6.1,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'IGIS_REIT',
    name: '이지스밸류플러스리츠',
    name_en: 'IGIS Value Plus REIT',
    sector: 'REALESTATE',
    ticker: 'IGRE',
    country: 'KR',
    financials: {
      revenue: 42,
      net_income: 4.8,
      total_assets: 520,
      total_debt: 260,
      equity: 260,
    },
    ratios: {
      icr: 2.2,
      de_ratio: 1.0,
      roe: 1.85,
      roa: 0.92,
    },
    sector_metrics: {
      ltv: 50.0,
      occupancy_rate: 90.0,
      rental_yield: 5.0,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'ESR_REIT',
    name: 'ESR켄달스퀘어리츠',
    name_en: 'ESR Kendall Square REIT',
    sector: 'REALESTATE',
    ticker: 'ESRE',
    country: 'KR',
    financials: {
      revenue: 60,
      net_income: 8.5,
      total_assets: 850,
      total_debt: 420,
      equity: 430,
    },
    ratios: {
      icr: 3.0,
      de_ratio: 0.98,
      roe: 1.98,
      roa: 1.0,
    },
    sector_metrics: {
      ltv: 49.4,
      occupancy_rate: 98.5,
      rental_yield: 6.5,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
];

// ========================================
// MANUFACTURING SECTOR (5/10 companies)
// ========================================

export const MANUFACTURING_COMPANIES: Company[] = [
  {
    id: 'HYUNDAI_MOTOR',
    name: '현대자동차',
    name_en: 'Hyundai Motor Company',
    sector: 'MANUFACTURING',
    ticker: 'HMM',
    country: 'KR',
    financials: {
      revenue: 1400000,       // 140조원
      net_income: 60000,      // 6조원
      total_assets: 2500000,  // 250조원
      total_debt: 800000,     // 80조원
      equity: 1700000,        // 170조원
      operating_income: 85000,
    },
    ratios: {
      icr: 8.5,
      de_ratio: 0.47,
      roe: 3.5,
      roa: 2.4,
    },
    sector_metrics: {
      capacity_utilization: 82.5,
      labor_cost_ratio: 12.5,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'LG_ELECTRONICS',
    name: 'LG전자',
    name_en: 'LG Electronics',
    sector: 'MANUFACTURING',
    ticker: 'LGE',
    country: 'KR',
    financials: {
      revenue: 800000,
      net_income: 15000,
      total_assets: 600000,
      total_debt: 150000,
      equity: 450000,
      operating_income: 30000,
    },
    ratios: {
      icr: 6.0,
      de_ratio: 0.33,
      roe: 3.3,
      roa: 2.5,
    },
    sector_metrics: {
      capacity_utilization: 78.0,
      labor_cost_ratio: 15.0,
    },
    location: {
      lat: 37.5665,
      lng: 126.9780,
    },
  },
  {
    id: 'POSCO',
    name: 'POSCO',
    name_en: 'POSCO Holdings',
    sector: 'MANUFACTURING',
    ticker: 'POSCO',
    country: 'KR',
    financials: {
      revenue: 750000,
      net_income: 25000,
      total_assets: 900000,
      total_debt: 300000,
      equity: 600000,
      operating_income: 45000,
    },
    ratios: {
      icr: 7.5,
      de_ratio: 0.50,
      roe: 4.2,
      roa: 2.8,
    },
    sector_metrics: {
      capacity_utilization: 85.0,
      labor_cost_ratio: 10.0,
    },
    location: {
      lat: 36.0190,
      lng: 129.3434,
    },
  },
  {
    id: 'TESLA',
    name: '테슬라',
    name_en: 'Tesla Inc.',
    sector: 'MANUFACTURING',
    ticker: 'TSLA',
    country: 'US',
    financials: {
      revenue: 96773,         // $96.77B (2023)
      net_income: 14997,      // $15.0B
      total_assets: 106618,   // $106.6B
      total_debt: 9570,       // $9.57B
      equity: 62634,          // $62.6B
      operating_income: 8891,
    },
    ratios: {
      icr: 15.2,
      de_ratio: 0.15,
      roe: 23.9,
      roa: 14.1,
    },
    sector_metrics: {
      capacity_utilization: 88.0,
      labor_cost_ratio: 8.5,
    },
    location: {
      lat: 37.3894,
      lng: -122.0819,
    },
  },
  {
    id: 'TOYOTA',
    name: '도요타자동차',
    name_en: 'Toyota Motor Corporation',
    sector: 'MANUFACTURING',
    ticker: 'TM',
    country: 'JP',
    financials: {
      revenue: 315900,        // ¥37.15T (~$315.9B)
      net_income: 24850,      // ¥2.92T (~$24.85B)
      total_assets: 551800,   // ¥64.87T (~$551.8B)
      total_debt: 180000,     // ~$180B
      equity: 280000,         // ~$280B
      operating_income: 32500,
    },
    ratios: {
      icr: 9.8,
      de_ratio: 0.64,
      roe: 8.9,
      roa: 4.5,
    },
    sector_metrics: {
      capacity_utilization: 86.5,
      labor_cost_ratio: 11.0,
    },
    location: {
      lat: 35.0844,
      lng: 137.1486,
    },
  },
];

// ========================================
// SEMICONDUCTOR SECTOR (4/10 companies)
// ========================================

export const SEMICONDUCTOR_COMPANIES: Company[] = [
  {
    id: 'SAMSUNG_ELEC',
    name: '삼성전자',
    name_en: 'Samsung Electronics',
    sector: 'SEMICONDUCTOR',
    ticker: 'SSNLF',
    country: 'KR',
    financials: {
      revenue: 2340000,       // 234조원 (2024)
      net_income: 230000,     // 23조원
      total_assets: 4500000,  // 450조원
      total_debt: 1000000,    // 100조원
      equity: 3500000,        // 350조원
      operating_income: 350000,
    },
    ratios: {
      icr: 12.5,
      de_ratio: 0.29,
      roe: 6.6,
      roa: 5.1,
    },
    sector_metrics: {
      wafer_utilization: 85.0,
      rd_intensity: 12.0,
      asp_change: -5.2,
      capex_ratio: 21.4,
    },
    location: {
      lat: 37.2636,
      lng: 127.0286,
    },
  },
  {
    id: 'SK_HYNIX',
    name: 'SK하이닉스',
    name_en: 'SK Hynix',
    sector: 'SEMICONDUCTOR',
    ticker: 'SKHYX',
    country: 'KR',
    financials: {
      revenue: 500000,
      net_income: 50000,
      total_assets: 800000,
      total_debt: 200000,
      equity: 600000,
      operating_income: 75000,
    },
    ratios: {
      icr: 10.0,
      de_ratio: 0.33,
      roe: 8.3,
      roa: 6.3,
    },
    sector_metrics: {
      wafer_utilization: 78.0,
      rd_intensity: 15.0,
      asp_change: -8.5,
      capex_ratio: 30.0,
    },
    location: {
      lat: 37.2636,
      lng: 127.0286,
    },
  },
  {
    id: 'TSMC',
    name: 'TSMC',
    name_en: 'Taiwan Semiconductor Manufacturing Company',
    sector: 'SEMICONDUCTOR',
    ticker: 'TSM',
    country: 'TW',
    financials: {
      revenue: 73400,         // $73.4B (2023)
      net_income: 29800,      // $29.8B
      total_assets: 109500,   // $109.5B
      total_debt: 15000,      // $15B
      equity: 94500,          // $94.5B
      operating_income: 38000,
    },
    ratios: {
      icr: 25.3,
      de_ratio: 0.16,
      roe: 31.5,
      roa: 27.2,
    },
    sector_metrics: {
      wafer_utilization: 92.0,
      rd_intensity: 8.5,
      asp_change: 3.2,
      capex_ratio: 35.0,
    },
    location: {
      lat: 24.7911,
      lng: 120.9969,
    },
  },
  {
    id: 'INTEL',
    name: '인텔',
    name_en: 'Intel Corporation',
    sector: 'SEMICONDUCTOR',
    ticker: 'INTC',
    country: 'US',
    financials: {
      revenue: 54200,         // $54.2B (2023)
      net_income: 1680,       // $1.68B
      total_assets: 191500,   // $191.5B
      total_debt: 48000,      // $48B
      equity: 111000,         // $111B
      operating_income: 2300,
    },
    ratios: {
      icr: 1.9,
      de_ratio: 0.43,
      roe: 1.5,
      roa: 0.9,
    },
    sector_metrics: {
      wafer_utilization: 65.0,
      rd_intensity: 27.0,
      asp_change: -12.5,
      capex_ratio: 45.0,
    },
    location: {
      lat: 37.3861,
      lng: -121.9634,
    },
  },
];

// ========================================
// CRYPTO SECTOR (20 companies)
// ========================================

export const CRYPTO_COMPANIES: Company[] = [
  {
    id: 'BTC',
    ticker: 'BTC-USD',
    name: 'Bitcoin',
    name_en: 'Bitcoin',
    sector: 'CRYPTO',
    country: 'GLOBAL',
    financials: {
      revenue: 0, // Crypto assets don't have traditional revenue
      net_income: 0,
      total_assets: 850000000, // Market cap in millions
      total_debt: 0,
      equity: 850000000,
      operating_income: 0,
    },
    ratios: {
      icr: 0,
      de_ratio: 0,
      pe_ratio: 0,
    },
    sector_metrics: {
      rd_intensity: 0,
    },
  },
  {
    id: 'ETH',
    ticker: 'ETH-USD',
    name: 'Ethereum',
    name_en: 'Ethereum',
    sector: 'CRYPTO',
    country: 'GLOBAL',
    financials: {
      revenue: 0,
      net_income: 0,
      total_assets: 280000000,
      total_debt: 0,
      equity: 280000000,
      operating_income: 0,
    },
    ratios: {
      icr: 0,
      de_ratio: 0,
      pe_ratio: 0,
    },
  },
  {
    id: 'BNB',
    ticker: 'BNB-USD',
    name: 'BNB',
    name_en: 'BNB',
    sector: 'CRYPTO',
    country: 'GLOBAL',
    financials: {
      revenue: 0,
      net_income: 0,
      total_assets: 45000000,
      total_debt: 0,
      equity: 45000000,
      operating_income: 0,
    },
    ratios: {
      icr: 0,
      de_ratio: 0,
      pe_ratio: 0,
    },
  },
  {
    id: 'SOL',
    ticker: 'SOL-USD',
    name: 'Solana',
    name_en: 'Solana',
    sector: 'CRYPTO',
    country: 'GLOBAL',
    financials: {
      revenue: 0,
      net_income: 0,
      total_assets: 35000000,
      total_debt: 0,
      equity: 35000000,
      operating_income: 0,
    },
    ratios: {
      icr: 0,
      de_ratio: 0,
      pe_ratio: 0,
    },
  },
  {
    id: 'ADA',
    ticker: 'ADA-USD',
    name: 'Cardano',
    name_en: 'Cardano',
    sector: 'CRYPTO',
    country: 'GLOBAL',
    financials: {
      revenue: 0,
      net_income: 0,
      total_assets: 12000000,
      total_debt: 0,
      equity: 12000000,
      operating_income: 0,
    },
    ratios: {
      icr: 0,
      de_ratio: 0,
      pe_ratio: 0,
    },
  },
];

// ========================================
// COMMODITIES SECTOR (20 companies)
// ========================================

export const COMMODITIES_COMPANIES: Company[] = [
  // GOLD MINING
  {
    id: 'BARRICK_GOLD',
    ticker: 'GOLD',
    name: '배릭골드',
    name_en: 'Barrick Gold Corporation',
    sector: 'COMMODITIES',
    country: 'CA',
    financials: {
      revenue: 11600,         // $11.6B (2023)
      net_income: 1800,       // $1.8B
      total_assets: 46500,    // $46.5B
      total_debt: 5200,       // $5.2B
      equity: 27300,          // $27.3B
      ebitda: 5800,
      operating_income: 3200,
    },
    ratios: {
      icr: 12.5,
      de_ratio: 0.19,
      roe: 6.6,
      roa: 3.9,
      pe_ratio: 18.2,
    },
    sector_metrics: {
      production_volume: 4.05, // Million oz gold (2023)
      reserves: 14.2,          // Years at current production
      price_sensitivity: 1.35, // High correlation to gold price
      extraction_cost: 1250,   // $1,250/oz all-in sustaining cost
    },
    location: { lat: 43.6532, lng: -79.3832 }, // Toronto
  },
  {
    id: 'NEWMONT',
    ticker: 'NEM',
    name: '뉴몬트',
    name_en: 'Newmont Corporation',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 12200,         // $12.2B (2023)
      net_income: 2100,       // $2.1B
      total_assets: 51800,    // $51.8B
      total_debt: 6800,       // $6.8B
      equity: 32500,          // $32.5B
      ebitda: 6200,
      operating_income: 3500,
    },
    ratios: {
      icr: 14.8,
      de_ratio: 0.21,
      roe: 6.5,
      roa: 4.1,
      pe_ratio: 19.5,
    },
    sector_metrics: {
      production_volume: 5.83, // Million oz gold
      reserves: 16.5,
      price_sensitivity: 1.42,
      extraction_cost: 1180,   // $1,180/oz AISC
    },
    location: { lat: 39.7392, lng: -104.9903 }, // Denver
  },
  {
    id: 'ANGLOGOLD',
    ticker: 'AU',
    name: '앵글로골드 애쉰티',
    name_en: 'AngloGold Ashanti',
    sector: 'COMMODITIES',
    country: 'ZA',
    financials: {
      revenue: 4300,
      net_income: 620,
      total_assets: 12500,
      total_debt: 2800,
      equity: 7200,
      ebitda: 1800,
      operating_income: 1100,
    },
    ratios: {
      icr: 8.5,
      de_ratio: 0.39,
      roe: 8.6,
      roa: 5.0,
      pe_ratio: 14.8,
    },
    sector_metrics: {
      production_volume: 2.62, // Million oz
      reserves: 12.8,
      price_sensitivity: 1.38,
      extraction_cost: 1320,
    },
    location: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
  },

  // SILVER MINING
  {
    id: 'FIRST_MAJESTIC',
    ticker: 'AG',
    name: '퍼스트 마제스틱',
    name_en: 'First Majestic Silver Corp.',
    sector: 'COMMODITIES',
    country: 'CA',
    financials: {
      revenue: 680,
      net_income: 85,
      total_assets: 1800,
      total_debt: 320,
      equity: 1250,
      ebitda: 280,
      operating_income: 150,
    },
    ratios: {
      icr: 9.2,
      de_ratio: 0.26,
      roe: 6.8,
      roa: 4.7,
      pe_ratio: 22.5,
    },
    sector_metrics: {
      production_volume: 25.5, // Million oz silver
      reserves: 18.5,
      price_sensitivity: 1.52, // High beta to silver prices
      extraction_cost: 15.8,   // $/oz silver
    },
    location: { lat: 49.2827, lng: -123.1207 }, // Vancouver
  },
  {
    id: 'PAN_AMERICAN',
    ticker: 'PAAS',
    name: '팬 아메리칸 실버',
    name_en: 'Pan American Silver Corp.',
    sector: 'COMMODITIES',
    country: 'CA',
    financials: {
      revenue: 1850,
      net_income: 220,
      total_assets: 5200,
      total_debt: 850,
      equity: 3800,
      ebitda: 720,
      operating_income: 420,
    },
    ratios: {
      icr: 11.5,
      de_ratio: 0.22,
      roe: 5.8,
      roa: 4.2,
      pe_ratio: 24.2,
    },
    sector_metrics: {
      production_volume: 24.2, // Million oz silver
      reserves: 22.0,
      price_sensitivity: 1.48,
      extraction_cost: 16.2,
    },
    location: { lat: 49.2827, lng: -123.1207 },
  },

  // IRON ORE / STEEL
  {
    id: 'VALE',
    ticker: 'VALE',
    name: '발레',
    name_en: 'Vale S.A.',
    sector: 'COMMODITIES',
    country: 'BR',
    financials: {
      revenue: 40100,         // $40.1B (2023)
      net_income: 5800,       // $5.8B
      total_assets: 115600,   // $115.6B
      total_debt: 18500,      // $18.5B
      equity: 62800,          // $62.8B
      ebitda: 18200,
      operating_income: 12500,
    },
    ratios: {
      icr: 15.2,
      de_ratio: 0.29,
      roe: 9.2,
      roa: 5.0,
      pe_ratio: 5.8,
    },
    sector_metrics: {
      production_volume: 310, // Million MT iron ore
      capacity_mta: 340,      // 340 MT capacity
      reserves: 42.0,         // Years
      price_sensitivity: 1.28,
      extraction_cost: 18.5,  // $/MT
    },
    location: { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
  },
  {
    id: 'BHP',
    ticker: 'BHP',
    name: 'BHP',
    name_en: 'BHP Group Limited',
    sector: 'COMMODITIES',
    country: 'AU',
    financials: {
      revenue: 55700,         // $55.7B (2023)
      net_income: 13400,      // $13.4B
      total_assets: 139200,   // $139.2B
      total_debt: 12800,      // $12.8B
      equity: 78500,          // $78.5B
      ebitda: 28500,
      operating_income: 20200,
    },
    ratios: {
      icr: 22.5,
      de_ratio: 0.16,
      roe: 17.1,
      roa: 9.6,
      pe_ratio: 10.2,
    },
    sector_metrics: {
      production_volume: 249, // Million MT iron ore
      capacity_mta: 290,
      reserves: 38.5,
      price_sensitivity: 1.22,
      extraction_cost: 17.2,
    },
    location: { lat: -33.8688, lng: 151.2093 }, // Sydney
  },
  {
    id: 'RIO_TINTO',
    ticker: 'RIO',
    name: '리오 틴토',
    name_en: 'Rio Tinto Group',
    sector: 'COMMODITIES',
    country: 'UK',
    financials: {
      revenue: 54040,         // $54.04B (2023)
      net_income: 11800,      // $11.8B
      total_assets: 112500,   // $112.5B
      total_debt: 11200,      // $11.2B
      equity: 58600,          // $58.6B
      ebitda: 24500,
      operating_income: 18200,
    },
    ratios: {
      icr: 20.8,
      de_ratio: 0.19,
      roe: 20.1,
      roa: 10.5,
      pe_ratio: 8.5,
    },
    sector_metrics: {
      production_volume: 321, // Million MT iron ore
      capacity_mta: 360,
      reserves: 45.0,
      price_sensitivity: 1.25,
      extraction_cost: 16.8,
    },
    location: { lat: 51.5074, lng: -0.1278 }, // London
  },
  {
    id: 'ARCELORMITTAL',
    ticker: 'MT',
    name: '아르셀로미탈',
    name_en: 'ArcelorMittal',
    sector: 'COMMODITIES',
    country: 'LU',
    financials: {
      revenue: 68300,         // $68.3B (2023)
      net_income: 6100,       // $6.1B
      total_assets: 112800,   // $112.8B
      total_debt: 8500,       // $8.5B
      equity: 58200,          // $58.2B
      ebitda: 12800,
      operating_income: 8200,
    },
    ratios: {
      icr: 16.5,
      de_ratio: 0.15,
      roe: 10.5,
      roa: 5.4,
      pe_ratio: 4.2,
    },
    sector_metrics: {
      production_volume: 58.1, // Million MT crude steel
      capacity_mta: 78.0,
      reserves: 28.0,
      price_sensitivity: 1.18,
      extraction_cost: 485,    // $/MT steel
    },
    location: { lat: 49.6116, lng: 6.1319 }, // Luxembourg
  },

  // OIL & GAS
  {
    id: 'SAUDI_ARAMCO',
    ticker: 'ARAMCO',
    name: '사우디 아람코',
    name_en: 'Saudi Arabian Oil Company',
    sector: 'COMMODITIES',
    country: 'SA',
    financials: {
      revenue: 400400,        // $400.4B (2023)
      net_income: 121300,     // $121.3B
      total_assets: 576000,   // $576B
      total_debt: 165000,     // $165B
      equity: 285000,         // $285B
      ebitda: 235000,
      operating_income: 180000,
    },
    ratios: {
      icr: 38.5,
      de_ratio: 0.58,
      roe: 42.6,
      roa: 21.1,
      pe_ratio: 15.8,
    },
    sector_metrics: {
      production_volume: 3650, // Million barrels oil equivalent
      reserves: 65.0,          // Years at current production
      price_sensitivity: 1.45, // High oil price correlation
      extraction_cost: 12.5,   // $/barrel lifting cost
    },
    location: { lat: 26.3927, lng: 50.0331 }, // Dhahran
  },
  {
    id: 'EXXONMOBIL',
    ticker: 'XOM',
    name: '엑슨모빌',
    name_en: 'Exxon Mobil Corporation',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 344600,        // $344.6B (2023)
      net_income: 36010,      // $36.0B
      total_assets: 376300,   // $376.3B
      total_debt: 35000,      // $35B
      equity: 194300,         // $194.3B
      ebitda: 78500,
      operating_income: 52500,
    },
    ratios: {
      icr: 28.5,
      de_ratio: 0.18,
      roe: 18.5,
      roa: 9.6,
      pe_ratio: 12.5,
    },
    sector_metrics: {
      production_volume: 1390, // Million barrels oil equivalent
      reserves: 18.5,
      price_sensitivity: 1.38,
      extraction_cost: 28.5,   // $/barrel
    },
    location: { lat: 32.7767, lng: -96.7970 }, // Irving, TX
  },
  {
    id: 'SHELL',
    ticker: 'SHEL',
    name: '쉘',
    name_en: 'Shell plc',
    sector: 'COMMODITIES',
    country: 'UK',
    financials: {
      revenue: 316614,        // $316.6B (2023)
      net_income: 28252,      // $28.3B
      total_assets: 404800,   // $404.8B
      total_debt: 68500,      // $68.5B
      equity: 202800,         // $202.8B
      ebitda: 68200,
      operating_income: 48500,
    },
    ratios: {
      icr: 22.8,
      de_ratio: 0.34,
      roe: 13.9,
      roa: 7.0,
      pe_ratio: 9.8,
    },
    sector_metrics: {
      production_volume: 1095, // Million barrels
      reserves: 14.2,
      price_sensitivity: 1.32,
      extraction_cost: 32.8,
    },
    location: { lat: 51.5074, lng: -0.1278 }, // London
  },
  {
    id: 'CHEVRON',
    ticker: 'CVX',
    name: '쉐브론',
    name_en: 'Chevron Corporation',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 200958,        // $201.0B (2023)
      net_income: 21370,      // $21.4B
      total_assets: 261762,   // $261.8B
      total_debt: 21000,      // $21B
      equity: 148000,         // $148B
      ebitda: 48500,
      operating_income: 34200,
    },
    ratios: {
      icr: 32.5,
      de_ratio: 0.14,
      roe: 14.4,
      roa: 8.2,
      pe_ratio: 10.8,
    },
    sector_metrics: {
      production_volume: 1120, // Million barrels
      reserves: 16.8,
      price_sensitivity: 1.35,
      extraction_cost: 30.2,
    },
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
  },
  {
    id: 'BP',
    ticker: 'BP',
    name: 'BP',
    name_en: 'BP plc',
    sector: 'COMMODITIES',
    country: 'UK',
    financials: {
      revenue: 248900,        // $248.9B (2023)
      net_income: 13800,      // $13.8B
      total_assets: 285200,   // $285.2B
      total_debt: 58500,      // $58.5B
      equity: 108500,         // $108.5B
      ebitda: 42500,
      operating_income: 25800,
    },
    ratios: {
      icr: 18.5,
      de_ratio: 0.54,
      roe: 12.7,
      roa: 4.8,
      pe_ratio: 8.2,
    },
    sector_metrics: {
      production_volume: 902, // Million barrels
      reserves: 12.5,
      price_sensitivity: 1.28,
      extraction_cost: 35.5,
    },
    location: { lat: 51.5074, lng: -0.1278 }, // London
  },

  // COPPER
  {
    id: 'FREEPORT',
    ticker: 'FCX',
    name: '프리포트 맥모란',
    name_en: 'Freeport-McMoRan Inc.',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 22800,         // $22.8B (2023)
      net_income: 2900,       // $2.9B
      total_assets: 48500,    // $48.5B
      total_debt: 9200,       // $9.2B
      equity: 27800,          // $27.8B
      ebitda: 8500,
      operating_income: 5200,
    },
    ratios: {
      icr: 14.5,
      de_ratio: 0.33,
      roe: 10.4,
      roa: 6.0,
      pe_ratio: 18.5,
    },
    sector_metrics: {
      production_volume: 4.18, // Million MT copper
      reserves: 32.5,
      price_sensitivity: 1.52, // High correlation to copper
      extraction_cost: 5850,   // $/MT copper
    },
    location: { lat: 33.4484, lng: -112.0740 }, // Phoenix
  },
  {
    id: 'SOUTHERN_COPPER',
    ticker: 'SCCO',
    name: '서던 코퍼',
    name_en: 'Southern Copper Corporation',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 9850,
      net_income: 2450,
      total_assets: 18500,
      total_debt: 4200,
      equity: 13800,
      ebitda: 5200,
      operating_income: 3800,
    },
    ratios: {
      icr: 18.5,
      de_ratio: 0.30,
      roe: 17.8,
      roa: 13.2,
      pe_ratio: 16.5,
    },
    sector_metrics: {
      production_volume: 1.02, // Million MT copper
      reserves: 48.0,
      price_sensitivity: 1.48,
      extraction_cost: 5200,
    },
    location: { lat: 33.4484, lng: -112.0740 },
  },

  // LITHIUM (Battery Materials)
  {
    id: 'ALBEMARLE',
    ticker: 'ALB',
    name: '알버말',
    name_en: 'Albemarle Corporation',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 7318,          // $7.3B (2023)
      net_income: 1850,       // $1.85B
      total_assets: 15200,    // $15.2B
      total_debt: 3800,       // $3.8B
      equity: 8500,           // $8.5B
      ebitda: 3200,
      operating_income: 2450,
    },
    ratios: {
      icr: 16.8,
      de_ratio: 0.45,
      roe: 21.8,
      roa: 12.2,
      pe_ratio: 8.5,
    },
    sector_metrics: {
      production_volume: 0.088, // Million MT lithium (LCE)
      reserves: 22.0,
      price_sensitivity: 1.85,  // High EV market correlation
      extraction_cost: 8500,    // $/MT LCE
    },
    location: { lat: 35.2271, lng: -80.8431 }, // Charlotte, NC
  },
  {
    id: 'SQM',
    ticker: 'SQM',
    name: 'SQM',
    name_en: 'Sociedad Química y Minera de Chile',
    sector: 'COMMODITIES',
    country: 'CL',
    financials: {
      revenue: 9180,
      net_income: 3250,
      total_assets: 12800,
      total_debt: 1850,
      equity: 9200,
      ebitda: 5200,
      operating_income: 4500,
    },
    ratios: {
      icr: 28.5,
      de_ratio: 0.20,
      roe: 35.3,
      roa: 25.4,
      pe_ratio: 6.2,
    },
    sector_metrics: {
      production_volume: 0.182, // Million MT lithium
      reserves: 38.0,
      price_sensitivity: 1.92,
      extraction_cost: 6200,
    },
    location: { lat: -33.4489, lng: -70.6693 }, // Santiago
  },

  // AGRICULTURAL COMMODITIES
  {
    id: 'CARGILL_PROXY',
    ticker: 'CARG-P',
    name: '카길',
    name_en: 'Cargill (Proxy - Private Company)',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 177000,        // $177B (2024 est, private)
      net_income: 4500,       // Est
      total_assets: 85000,    // Est
      total_debt: 18000,      // Est
      equity: 38000,          // Est
      ebitda: 12500,
      operating_income: 8200,
    },
    ratios: {
      icr: 12.5,
      de_ratio: 0.47,
      roe: 11.8,
      roa: 5.3,
      pe_ratio: 14.2,
    },
    sector_metrics: {
      production_volume: 125, // Million MT grains/oilseeds handled
      price_sensitivity: 0.85, // Moderate commodity correlation
    },
    location: { lat: 44.9778, lng: -93.2650 }, // Minneapolis
  },
  {
    id: 'ADM',
    ticker: 'ADM',
    name: 'ADM',
    name_en: 'Archer-Daniels-Midland Company',
    sector: 'COMMODITIES',
    country: 'US',
    financials: {
      revenue: 101848,        // $101.8B (2023)
      net_income: 3462,       // $3.5B
      total_assets: 52786,    // $52.8B
      total_debt: 9200,       // $9.2B
      equity: 24500,          // $24.5B
      ebitda: 7800,
      operating_income: 5200,
    },
    ratios: {
      icr: 14.2,
      de_ratio: 0.38,
      roe: 14.1,
      roa: 6.6,
      pe_ratio: 11.8,
    },
    sector_metrics: {
      production_volume: 180, // Million MT processed
      price_sensitivity: 0.92,
    },
    location: { lat: 41.8781, lng: -87.6298 }, // Chicago
  },
];

// ========================================
// OPTIONS SECTOR (5/5 companies)
// ========================================

export const OPTIONS_COMPANIES: Company[] = [
  {
    id: 'OPT-SPX',
    ticker: 'SPX',
    name: 'S&P 500 Index Options',
    name_en: 'S&P 500 Index Options',
    sector: 'OPTIONS',
    country: 'US',
    financials: {
      revenue: 580000, // Daily volume (contracts)
      net_income: 12500, // Premium volume (million USD)
      total_assets: 4200000, // Open interest
      total_debt: 0,
      equity: 4200000,
      ebitda: 12500,
      operating_income: 12500,
    },
    ratios: {
      icr: 999, // N/A for options
      de_ratio: 0,
      roe: 0.15,
      roa: 0.15,
      current_ratio: 1.0,
      pe_ratio: 18.5,
    },
    sector_metrics: {
      delta: 0.52, // Average delta
      gamma: 0.018,
      vega: 0.24,
      theta: -0.08,
    },
    location: { lat: 41.8781, lng: -87.6298 }, // Chicago (CBOE)
  },
  {
    id: 'OPT-VIX',
    ticker: 'VIX',
    name: 'CBOE Volatility Index Options',
    name_en: 'VIX Options',
    sector: 'OPTIONS',
    country: 'US',
    financials: {
      revenue: 280000, // Daily volume
      net_income: 5200, // Premium volume (million USD)
      total_assets: 1800000, // Open interest
      total_debt: 0,
      equity: 1800000,
      ebitda: 5200,
      operating_income: 5200,
    },
    ratios: {
      icr: 999,
      de_ratio: 0,
      roe: 0.18,
      roa: 0.18,
      current_ratio: 1.0,
      pe_ratio: 22.0,
    },
    sector_metrics: {
      delta: 0.48,
      gamma: 0.022,
      vega: 0.35,
      theta: -0.12,
    },
    location: { lat: 41.8781, lng: -87.6298 },
  },
  {
    id: 'OPT-KOSPI200',
    ticker: 'KOSPI200',
    name: 'KOSPI 200 Options',
    name_en: 'KOSPI 200 Index Options',
    sector: 'OPTIONS',
    country: 'KR',
    financials: {
      revenue: 820000, // Daily volume (highest in world)
      net_income: 8900, // Premium volume
      total_assets: 2200000, // Open interest
      total_debt: 0,
      equity: 2200000,
      ebitda: 8900,
      operating_income: 8900,
    },
    ratios: {
      icr: 999,
      de_ratio: 0,
      roe: 0.16,
      roa: 0.16,
      current_ratio: 1.0,
      pe_ratio: 16.8,
    },
    sector_metrics: {
      delta: 0.50,
      gamma: 0.020,
      vega: 0.28,
      theta: -0.09,
    },
    location: { lat: 37.5665, lng: 126.9780 }, // Seoul (KRX)
  },
  {
    id: 'OPT-EQUITY',
    ticker: 'EQUITY-OPT',
    name: 'US Equity Options (AAPL, TSLA, NVDA)',
    name_en: 'Individual Equity Options',
    sector: 'OPTIONS',
    country: 'US',
    financials: {
      revenue: 1250000, // Daily volume (all equity options)
      net_income: 18500, // Premium volume
      total_assets: 5800000, // Open interest
      total_debt: 0,
      equity: 5800000,
      ebitda: 18500,
      operating_income: 18500,
    },
    ratios: {
      icr: 999,
      de_ratio: 0,
      roe: 0.14,
      roa: 0.14,
      current_ratio: 1.0,
      pe_ratio: 20.5,
    },
    sector_metrics: {
      delta: 0.55, // Average across all strikes
      gamma: 0.025,
      vega: 0.32,
      theta: -0.10,
    },
    location: { lat: 40.7128, lng: -74.0060 }, // New York
  },
  {
    id: 'OPT-FX',
    ticker: 'FX-OPT',
    name: 'FX Options (EUR/USD, USD/JPY)',
    name_en: 'Currency Options',
    sector: 'OPTIONS',
    country: 'GLOBAL',
    financials: {
      revenue: 420000, // Daily volume
      net_income: 9200, // Premium volume
      total_assets: 3200000, // Open interest
      total_debt: 0,
      equity: 3200000,
      ebitda: 9200,
      operating_income: 9200,
    },
    ratios: {
      icr: 999,
      de_ratio: 0,
      roe: 0.17,
      roa: 0.17,
      current_ratio: 1.0,
      pe_ratio: 19.2,
    },
    sector_metrics: {
      delta: 0.51,
      gamma: 0.019,
      vega: 0.30,
      theta: -0.11,
    },
    location: { lat: 51.5074, lng: -0.1278 }, // London
  },
];

// ========================================
// CONSOLIDATED DATA
// ========================================

export const ALL_COMPANIES: Company[] = [
  ...BANKING_COMPANIES,
  ...REALESTATE_COMPANIES,
  ...MANUFACTURING_COMPANIES,
  ...SEMICONDUCTOR_COMPANIES,
  ...CRYPTO_COMPANIES,
  ...COMMODITIES_COMPANIES,
  ...OPTIONS_COMPANIES,
];

export const COMPANY_LINKS: CompanyLink[] = [
  // Banking → Real Estate lending
  { source: 'SH_BANK', target: 'SH_REIT', amount: 100, type: 'LENDING' },
  { source: 'SH_BANK', target: 'IR_REIT', amount: 200, type: 'LENDING' },
  { source: 'SH_BANK', target: 'NH_REIT', amount: 50, type: 'LENDING' },
  { source: 'KB_BANK', target: 'SH_REIT', amount: 120, type: 'LENDING' },
  { source: 'KB_BANK', target: 'IR_REIT', amount: 80, type: 'LENDING' },
  { source: 'WR_BANK', target: 'NH_REIT', amount: 150, type: 'LENDING' },
];

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getCompanyById(id: string): Company | undefined {
  return ALL_COMPANIES.find(c => c.id === id);
}

export function getCompaniesBySector(sector: Sector): Company[] {
  return ALL_COMPANIES.filter(c => c.sector === sector);
}

export function getCompanyLinks(companyId: string): CompanyLink[] {
  return COMPANY_LINKS.filter(
    link => link.source === companyId || link.target === companyId
  );
}

export function getCompanyCount(): { total: number; by_sector: Record<Sector, number> } {
  return {
    total: ALL_COMPANIES.length,
    by_sector: {
      BANKING: BANKING_COMPANIES.length,
      REALESTATE: REALESTATE_COMPANIES.length,
      MANUFACTURING: MANUFACTURING_COMPANIES.length,
      SEMICONDUCTOR: SEMICONDUCTOR_COMPANIES.length,
      CRYPTO: CRYPTO_COMPANIES.length,
      COMMODITIES: COMMODITIES_COMPANIES.length,
      OPTIONS: OPTIONS_COMPANIES.length,
    },
  };
}

/**
 * 🔍 Auto-assign topics to companies based on sector
 * This enables topic-based filtering in visualizations
 */
export function assignTopicsToCompany(company: Company): Company {
  const topicMap: Record<Sector, Topic[]> = {
    'BANKING': ['hedge-fund'],
    'REALESTATE': ['real-estate'],
    'MANUFACTURING': ['supply-chain'],
    'SEMICONDUCTOR': ['supply-chain'],
    'OPTIONS': ['hedge-fund'],
    'CRYPTO': ['crypto'],
    'COMMODITIES': ['commodities', 'supply-chain'],
  };

  return {
    ...company,
    topics: topicMap[company.sector] || [],
  };
}

/**
 * 🔍 Get companies by topic
 */
export function getCompaniesByTopic(topic: Topic): Company[] {
  if (topic === 'all') return companies;
  return companies.filter(c => c.topics?.includes(topic));
}

// ========================================
// SYNTHETIC DATA GENERATOR
// (Expand dataset to 100+ companies)
// ========================================

export function generateSyntheticCompanies(baseCompanies: Company[], targetCount: number): Company[] {
  const synthetic: Company[] = [];
  let index = 1;

  while (baseCompanies.length + synthetic.length < targetCount) {
    const template = baseCompanies[index % baseCompanies.length];
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation

    synthetic.push({
      ...template,
      id: `${template.id}_SYN_${index}`,
      ticker: `${template.ticker}-${index}`,
      name: `${template.name} ${index}`,
      name_en: template.name_en ? `${template.name_en} ${index}` : undefined,
      financials: {
        revenue: Math.round(template.financials.revenue * (1 + variation)),
        net_income: Math.round(template.financials.net_income * (1 + variation)),
        total_assets: Math.round(template.financials.total_assets * (1 + variation)),
        total_debt: Math.round(template.financials.total_debt * (1 + variation)),
        equity: Math.round(template.financials.equity * (1 + variation)),
        operating_income: template.financials.operating_income
          ? Math.round(template.financials.operating_income * (1 + variation))
          : undefined,
        ebitda: template.financials.ebitda
          ? Math.round(template.financials.ebitda * (1 + variation))
          : undefined,
      },
      ratios: {
        icr: template.ratios.icr * (1 + variation * 0.5),
        de_ratio: template.ratios.de_ratio * (1 + variation * 0.5),
        roe: template.ratios.roe ? template.ratios.roe * (1 + variation * 0.5) : undefined,
        roa: template.ratios.roa ? template.ratios.roa * (1 + variation * 0.5) : undefined,
        current_ratio: template.ratios.current_ratio,
        pe_ratio: template.ratios.pe_ratio ? template.ratios.pe_ratio * (1 + variation * 0.5) : undefined,
      },
    });

    index++;
  }

  return synthetic;
}

// Generate extended dataset (100+ companies)
const SYNTHETIC_BANKING = generateSyntheticCompanies(BANKING_COMPANIES, 20);
const SYNTHETIC_REALESTATE = generateSyntheticCompanies(REALESTATE_COMPANIES, 20);
const SYNTHETIC_MANUFACTURING = generateSyntheticCompanies(MANUFACTURING_COMPANIES, 20);
const SYNTHETIC_SEMICONDUCTOR = generateSyntheticCompanies(SEMICONDUCTOR_COMPANIES, 20);
const SYNTHETIC_CRYPTO = generateSyntheticCompanies(CRYPTO_COMPANIES, 15);
const SYNTHETIC_COMMODITIES = generateSyntheticCompanies(COMMODITIES_COMPANIES, 25);

const EXTENDED_COMPANIES_RAW: Company[] = [
  ...ALL_COMPANIES,
  ...SYNTHETIC_BANKING,
  ...SYNTHETIC_REALESTATE,
  ...SYNTHETIC_MANUFACTURING,
  ...SYNTHETIC_SEMICONDUCTOR,
  ...SYNTHETIC_CRYPTO,
  ...SYNTHETIC_COMMODITIES,
];

// 🔍 Apply topics to all companies automatically
export const EXTENDED_COMPANIES: Company[] = EXTENDED_COMPANIES_RAW.map(assignTopicsToCompany);

// Use extended dataset by default
export const companies = EXTENDED_COMPANIES;
