/**
 * Ownership Networks & Cross-Shareholding
 *
 * Institutional holdings, insider ownership, cross-shareholding relationships
 * Data sources: 13F filings, proxy statements, Bloomberg (2024 Q2)
 */

/**
 * Shareholder Entity
 */
export interface Shareholder {
  id: string;
  name: string;
  type: 'institutional' | 'insider' | 'individual' | 'corporate' | 'government';
  country: string;

  // Financial metrics
  aum?: number; // Assets under management (millions USD)
  totalHoldings?: number; // Total portfolio value

  description: string;
}

/**
 * Ownership Stake
 */
export interface OwnershipStake {
  shareholderId: string;
  companyId: string;
  companyName: string;
  shares: number; // Number of shares
  value: number; // Market value (millions USD)
  percentOwnership: number; // % of outstanding shares
  changeQoQ?: number; // % change quarter-over-quarter
  filingDate: string; // Last filing date
}

/**
 * Cross-Shareholding Relationship
 */
export interface CrossHolding {
  from: string; // Company A ID
  to: string; // Company B ID
  ownership: number; // % ownership
  value: number; // Market value (millions USD)
  relationship: 'subsidiary' | 'affiliate' | 'strategic' | 'passive';
  description: string;
}

// ============================================================================
// Major Institutional Investors
// ============================================================================

export const VANGUARD: Shareholder = {
  id: 'vanguard',
  name: 'The Vanguard Group',
  type: 'institutional',
  country: 'USA',
  aum: 8500000, // $8.5T AUM
  description: 'World\'s largest mutual fund company. Passive index investing. Holds 5-8% of most major US companies.',
};

export const BLACKROCK: Shareholder = {
  id: 'blackrock',
  name: 'BlackRock Inc.',
  type: 'institutional',
  country: 'USA',
  aum: 10000000, // $10T AUM
  description: 'World\'s largest asset manager. iShares ETFs. Active in corporate governance and ESG.',
};

export const STATE_STREET: Shareholder = {
  id: 'state-street',
  name: 'State Street Corporation',
  type: 'institutional',
  country: 'USA',
  aum: 4300000, // $4.3T AUM
  description: 'Third-largest asset manager. SPDR ETFs. Major index fund provider.',
};

export const FIDELITY: Shareholder = {
  id: 'fidelity',
  name: 'Fidelity Investments',
  type: 'institutional',
  country: 'USA',
  aum: 4900000, // $4.9T AUM
  description: 'Largest mutual fund company. Both passive and active strategies. Major retail investor platform.',
};

export const JPMORGAN: Shareholder = {
  id: 'jpmorgan',
  name: 'JPMorgan Chase & Co.',
  type: 'institutional',
  country: 'USA',
  aum: 3200000, // $3.2T AUM
  description: 'Largest US bank by assets. Asset management division manages pensions, endowments, sovereign wealth.',
};

export const GEODE_CAPITAL: Shareholder = {
  id: 'geode',
  name: 'Geode Capital Management',
  type: 'institutional',
  country: 'USA',
  aum: 1100000, // $1.1T AUM
  description: 'Quantitative asset manager. Subsidiary of Fidelity. Index and enhanced index strategies.',
};

export const NORGES_BANK: Shareholder = {
  id: 'norges-bank',
  name: 'Norges Bank (Norway Sovereign Wealth)',
  type: 'government',
  country: 'Norway',
  aum: 1600000, // $1.6T AUM
  description: 'World\'s largest sovereign wealth fund. Owns 1.5% of global stocks. Long-term value investor.',
};

// ============================================================================
// NVIDIA Ownership Structure (Example)
// ============================================================================

export const NVIDIA_OWNERSHIP: OwnershipStake[] = [
  {
    shareholderId: 'vanguard',
    companyId: 'nvidia',
    companyName: 'NVIDIA Corporation',
    shares: 196000000, // ~196M shares
    value: 175000, // $175B market value
    percentOwnership: 7.9,
    changeQoQ: 0.2, // +0.2% QoQ
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'blackrock',
    companyId: 'nvidia',
    companyName: 'NVIDIA Corporation',
    shares: 177000000,
    value: 158000, // $158B
    percentOwnership: 7.1,
    changeQoQ: 0.5, // +0.5% QoQ
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'state-street',
    companyId: 'nvidia',
    companyName: 'NVIDIA Corporation',
    shares: 88000000,
    value: 79000, // $79B
    percentOwnership: 3.5,
    changeQoQ: 0.1,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'fidelity',
    companyId: 'nvidia',
    companyName: 'NVIDIA Corporation',
    shares: 72000000,
    value: 64000, // $64B
    percentOwnership: 2.9,
    changeQoQ: -0.3, // Reduced position
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'geode',
    companyId: 'nvidia',
    companyName: 'NVIDIA Corporation',
    shares: 45000000,
    value: 40000,
    percentOwnership: 1.8,
    changeQoQ: 0.2,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'jen-hsun-huang',
    companyId: 'nvidia',
    companyName: 'NVIDIA Corporation',
    shares: 87000000, // Founder & CEO
    value: 78000,
    percentOwnership: 3.5,
    changeQoQ: 0.0, // Stable
    filingDate: '2024-06-30',
  },
];

// Insider - Jensen Huang
export const JENSEN_HUANG: Shareholder = {
  id: 'jen-hsun-huang',
  name: 'Jensen Huang (Jen-Hsun Huang)',
  type: 'insider',
  country: 'USA',
  totalHoldings: 78000, // $78B NVIDIA stake
  description: 'Co-founder, President & CEO of NVIDIA. Leather jacket icon. Visionary behind CUDA and AI strategy.',
};

// ============================================================================
// TSMC Ownership Structure
// ============================================================================

export const TSMC_OWNERSHIP: OwnershipStake[] = [
  {
    shareholderId: 'taiwan-government',
    companyId: 'tsmc',
    companyName: 'Taiwan Semiconductor Manufacturing Company',
    shares: 630000000, // Government through funds
    value: 98000,
    percentOwnership: 6.4,
    changeQoQ: 0.0,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'vanguard',
    companyId: 'tsmc',
    companyName: 'Taiwan Semiconductor Manufacturing Company',
    shares: 410000000,
    value: 64000,
    percentOwnership: 4.2,
    changeQoQ: 0.3,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'blackrock',
    companyId: 'tsmc',
    companyName: 'Taiwan Semiconductor Manufacturing Company',
    shares: 385000000,
    value: 60000,
    percentOwnership: 3.9,
    changeQoQ: 0.4,
    filingDate: '2024-06-30',
  },
];

export const TAIWAN_GOVERNMENT: Shareholder = {
  id: 'taiwan-government',
  name: 'Taiwan Government',
  type: 'government',
  country: 'Taiwan',
  description: 'Government ownership through National Development Fund. Strategic asset for Taiwan\'s semiconductor leadership.',
};

// ============================================================================
// SK Hynix & Samsung Ownership (Korean Chaebol Structure)
// ============================================================================

export const SK_GROUP: Shareholder = {
  id: 'sk-group',
  name: 'SK Group (Chaebol)',
  type: 'corporate',
  country: 'South Korea',
  description: 'Korea\'s 3rd largest chaebol. Complex cross-shareholding structure. SK Holdings → SK Hynix.',
};

export const CHEY_FAMILY: Shareholder = {
  id: 'chey-family',
  name: 'Chey Family (SK Group)',
  type: 'individual',
  country: 'South Korea',
  description: 'Founding family of SK Group. Controls group through pyramid structure with <10% equity ownership.',
};

export const SK_HYNIX_OWNERSHIP: OwnershipStake[] = [
  {
    shareholderId: 'sk-group',
    companyId: 'sk-hynix',
    companyName: 'SK Hynix',
    shares: 98000000,
    value: 12000,
    percentOwnership: 20.1, // Controlling stake
    changeQoQ: 0.0,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'chey-family',
    companyId: 'sk-hynix',
    companyName: 'SK Hynix',
    shares: 25000000,
    value: 3100,
    percentOwnership: 5.1,
    changeQoQ: 0.0,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'blackrock',
    companyId: 'sk-hynix',
    companyName: 'SK Hynix',
    shares: 35000000,
    value: 4300,
    percentOwnership: 7.2,
    changeQoQ: 0.5,
    filingDate: '2024-06-30',
  },
];

export const LEE_FAMILY: Shareholder = {
  id: 'lee-family',
  name: 'Lee Family (Samsung)',
  type: 'individual',
  country: 'South Korea',
  description: 'Founding family of Samsung Group. Lee Jae-yong (Jay Y. Lee) is chairman. Complex cross-holding structure.',
};

export const SAMSUNG_OWNERSHIP: OwnershipStake[] = [
  {
    shareholderId: 'lee-family',
    companyId: 'samsung',
    companyName: 'Samsung Electronics',
    shares: 320000000,
    value: 15000,
    percentOwnership: 5.7, // Direct ownership
    changeQoQ: 0.0,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'samsung-life',
    companyId: 'samsung',
    companyName: 'Samsung Electronics',
    shares: 450000000,
    value: 21000,
    percentOwnership: 8.0, // Affiliate holding
    changeQoQ: 0.0,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'norges-bank',
    companyId: 'samsung',
    companyName: 'Samsung Electronics',
    shares: 180000000,
    value: 8400,
    percentOwnership: 3.2,
    changeQoQ: 0.1,
    filingDate: '2024-06-30',
  },
];

export const SAMSUNG_LIFE: Shareholder = {
  id: 'samsung-life',
  name: 'Samsung Life Insurance',
  type: 'corporate',
  country: 'South Korea',
  description: 'Samsung affiliate. Key part of cross-shareholding structure. Holds Samsung Electronics shares.',
};

// ============================================================================
// Microsoft Ownership
// ============================================================================

export const MICROSOFT_OWNERSHIP: OwnershipStake[] = [
  {
    shareholderId: 'vanguard',
    companyId: 'microsoft',
    companyName: 'Microsoft Corporation',
    shares: 658000000,
    value: 275000,
    percentOwnership: 8.8,
    changeQoQ: 0.2,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'blackrock',
    companyId: 'microsoft',
    companyName: 'Microsoft Corporation',
    shares: 524000000,
    value: 219000,
    percentOwnership: 7.0,
    changeQoQ: 0.3,
    filingDate: '2024-06-30',
  },
  {
    shareholderId: 'bill-gates',
    companyId: 'microsoft',
    companyName: 'Microsoft Corporation',
    shares: 103000000, // Reduced from founding stake
    value: 43000,
    percentOwnership: 1.4,
    changeQoQ: -0.1, // Philanthropic sales
    filingDate: '2024-06-30',
  },
];

export const BILL_GATES: Shareholder = {
  id: 'bill-gates',
  name: 'Bill Gates',
  type: 'insider',
  country: 'USA',
  totalHoldings: 43000,
  description: 'Co-founder of Microsoft. Philanthropist. Reduced stake over time for Bill & Melinda Gates Foundation.',
};

// ============================================================================
// Cross-Shareholding Relationships
// ============================================================================

export const CROSS_HOLDINGS: CrossHolding[] = [
  // Samsung Group internal cross-holdings
  {
    from: 'samsung',
    to: 'samsung-life',
    ownership: 8.3,
    value: 4200,
    relationship: 'affiliate',
    description: 'Samsung Electronics owns 8.3% of Samsung Life Insurance. Circular ownership structure.',
  },
  {
    from: 'samsung-life',
    to: 'samsung',
    ownership: 8.0,
    value: 21000,
    relationship: 'affiliate',
    description: 'Samsung Life owns 8% of Samsung Electronics. Strengthens family control.',
  },

  // SK Group cross-holdings
  {
    from: 'sk-holdings',
    to: 'sk-hynix',
    ownership: 20.1,
    value: 12000,
    relationship: 'subsidiary',
    description: 'SK Holdings controls SK Hynix through 20.1% stake. Operating subsidiary.',
  },

  // Strategic partnerships
  {
    from: 'microsoft',
    to: 'openai',
    ownership: 49.0,
    value: 13000, // $13B investment
    relationship: 'strategic',
    description: 'Microsoft owns 49% of OpenAI (capped profit structure). Exclusive cloud provider.',
  },

  // TSMC-NXP partnership
  {
    from: 'tsmc',
    to: 'nxp',
    ownership: 27.5,
    value: 8500,
    relationship: 'strategic',
    description: 'TSMC owns 27.5% of NXP Semiconductors through VanguardInternational Semiconductor.',
  },
];

// ============================================================================
// Additional Entities
// ============================================================================

export const SK_HOLDINGS: Shareholder = {
  id: 'sk-holdings',
  name: 'SK Holdings',
  type: 'corporate',
  country: 'South Korea',
  description: 'Holding company of SK Group. Controls operating companies through cross-shareholding.',
};

export const OPENAI: Shareholder = {
  id: 'openai',
  name: 'OpenAI',
  type: 'corporate',
  country: 'USA',
  description: 'AI research lab. Created ChatGPT and GPT-4. Microsoft is largest investor and partner.',
};

// ============================================================================
// All Shareholders
// ============================================================================

export const ALL_SHAREHOLDERS: Shareholder[] = [
  VANGUARD,
  BLACKROCK,
  STATE_STREET,
  FIDELITY,
  JPMORGAN,
  GEODE_CAPITAL,
  NORGES_BANK,
  JENSEN_HUANG,
  TAIWAN_GOVERNMENT,
  SK_GROUP,
  CHEY_FAMILY,
  LEE_FAMILY,
  SAMSUNG_LIFE,
  BILL_GATES,
  SK_HOLDINGS,
  OPENAI,
];

// ============================================================================
// All Ownership Stakes
// ============================================================================

export const ALL_OWNERSHIP_STAKES: OwnershipStake[] = [
  ...NVIDIA_OWNERSHIP,
  ...TSMC_OWNERSHIP,
  ...SK_HYNIX_OWNERSHIP,
  ...SAMSUNG_OWNERSHIP,
  ...MICROSOFT_OWNERSHIP,
];

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Calculate ownership concentration (Herfindahl-Hirschman Index)
 */
export function calculateOwnershipConcentration(stakes: OwnershipStake[]): {
  hhi: number;
  classification: 'Highly Concentrated' | 'Moderately Concentrated' | 'Diffuse';
} {
  // HHI = sum of squared ownership percentages
  const hhi = stakes.reduce((sum, stake) => sum + Math.pow(stake.percentOwnership, 2), 0);

  let classification: 'Highly Concentrated' | 'Moderately Concentrated' | 'Diffuse';
  if (hhi > 1800) classification = 'Highly Concentrated';
  else if (hhi > 1000) classification = 'Moderately Concentrated';
  else classification = 'Diffuse';

  return { hhi, classification };
}

/**
 * Find largest shareholders
 */
export function getTopShareholders(
  companyId: string,
  stakes: OwnershipStake[],
  limit: number = 10
): OwnershipStake[] {
  return stakes
    .filter((s) => s.companyId === companyId)
    .sort((a, b) => b.percentOwnership - a.percentOwnership)
    .slice(0, limit);
}

/**
 * Calculate institutional ownership %
 */
export function getInstitutionalOwnership(companyId: string, stakes: OwnershipStake[]): number {
  const institutionalShareholders = new Set([
    'vanguard',
    'blackrock',
    'state-street',
    'fidelity',
    'jpmorgan',
    'geode',
  ]);

  const institutional = stakes.filter(
    (s) => s.companyId === companyId && institutionalShareholders.has(s.shareholderId)
  );

  return institutional.reduce((sum, s) => sum + s.percentOwnership, 0);
}

/**
 * Calculate insider ownership %
 */
export function getInsiderOwnership(companyId: string, stakes: OwnershipStake[]): number {
  const insiderShareholders = new Set([
    'jen-hsun-huang',
    'bill-gates',
    'chey-family',
    'lee-family',
  ]);

  const insiders = stakes.filter(
    (s) => s.companyId === companyId && insiderShareholders.has(s.shareholderId)
  );

  return insiders.reduce((sum, s) => sum + s.percentOwnership, 0);
}

/**
 * Detect circular ownership (for chaebol analysis)
 */
export function detectCircularOwnership(holdings: CrossHolding[]): {
  circular: boolean;
  cycles: string[][];
} {
  const cycles: string[][] = [];

  // Simple cycle detection for A→B→A patterns
  for (const holding1 of holdings) {
    const reciprocal = holdings.find(
      (h) => h.from === holding1.to && h.to === holding1.from
    );

    if (reciprocal) {
      const cycle = [holding1.from, holding1.to, holding1.from];
      // Check if not already added
      if (!cycles.some((c) => c[0] === cycle[0] && c[1] === cycle[1])) {
        cycles.push(cycle);
      }
    }
  }

  return {
    circular: cycles.length > 0,
    cycles,
  };
}

/**
 * Calculate control premium (excess ownership value)
 */
export function calculateControlPremium(
  ownershipPercent: number,
  marketValue: number
): number {
  // Simple model: control premium starts at 25% ownership
  if (ownershipPercent < 25) return 0;

  const controlFactor = Math.min((ownershipPercent - 25) / 25, 1); // 0 to 1
  const premiumRate = 0.20; // 20% premium at full control

  return marketValue * controlFactor * premiumRate;
}
