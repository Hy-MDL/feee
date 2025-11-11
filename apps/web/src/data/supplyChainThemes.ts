/**
 * Supply Chain Themes
 *
 * Different supply chain visualizations for different economic scenarios
 */

export interface CircuitNode {
  id: string;
  label: string;
  level: 'macro' | 'sector' | 'component' | 'company';
  x: number;
  y: number;
  color: string;
  impact?: number;
}

export interface CircuitConnection {
  from: string;
  to: string;
  strength: number;
  label?: string;
}

export interface SupplyChainTheme {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: CircuitNode[];
  connections: CircuitConnection[];
}

const LEVEL_COLORS = {
  macro: '#FFD700',       // Gold
  sector: '#00E5FF',      // Cyan
  component: '#C084FC',   // Purple
  company: '#00FF9F',     // Emerald
};

// Theme 1: Fed Rate Impact (Traditional Banking & Real Estate)
export const FED_RATE_THEME: SupplyChainTheme = {
  id: 'fed_rate_impact',
  name: 'Fed Rate Impact',
  description: 'Interest rate changes affecting banking and real estate sectors',
  icon: '🏦',
  nodes: [
    // Macro
    { id: 'fed_rate', label: 'Fed Rate', level: 'macro', x: 50, y: 100, color: LEVEL_COLORS.macro },
    // Sectors
    { id: 'banking', label: 'Banking', level: 'sector', x: 250, y: 60, color: '#06B6D4' },
    { id: 'realestate', label: 'Real Estate', level: 'sector', x: 250, y: 140, color: '#10B981' },
    // Companies
    { id: 'kb', label: 'KB Bank', level: 'company', x: 450, y: 40, color: '#06B6D4' },
    { id: 'shinhan', label: 'Shinhan', level: 'company', x: 450, y: 80, color: '#06B6D4' },
    { id: 'samsung_c', label: 'Samsung C&T', level: 'company', x: 450, y: 140, color: '#10B981' },
    { id: 'lotte', label: 'Lotte Const', level: 'company', x: 450, y: 180, color: '#10B981' },
  ],
  connections: [
    { from: 'fed_rate', to: 'banking', strength: 0.9, label: 'NIM +' },
    { from: 'fed_rate', to: 'realestate', strength: -0.8, label: 'Borrowing Cost' },
    { from: 'banking', to: 'kb', strength: 0.95 },
    { from: 'banking', to: 'shinhan', strength: 0.9 },
    { from: 'realestate', to: 'samsung_c', strength: 0.85 },
    { from: 'realestate', to: 'lotte', strength: 0.8 },
  ],
};

// Theme 2: AI Boom (NVIDIA GPU Supply Chain)
export const AI_BOOM_THEME: SupplyChainTheme = {
  id: 'ai_boom',
  name: 'AI Boom',
  description: 'GPU demand driving semiconductor supply chain',
  icon: '🤖',
  nodes: [
    // Macro
    { id: 'ai_investment', label: 'AI Investment', level: 'macro', x: 50, y: 100, color: LEVEL_COLORS.macro },
    // Companies (GPU makers)
    { id: 'nvidia', label: 'NVIDIA', level: 'company', x: 250, y: 60, color: '#C026D3' },
    { id: 'amd', label: 'AMD', level: 'company', x: 250, y: 120, color: '#DC2626' },
    // Components
    { id: 'hbm', label: 'HBM3E', level: 'component', x: 450, y: 40, color: LEVEL_COLORS.component },
    { id: 'tsmc_fab', label: 'TSMC Fab', level: 'component', x: 450, y: 100, color: LEVEL_COLORS.component },
    { id: 'cowos', label: 'CoWoS', level: 'component', x: 450, y: 160, color: LEVEL_COLORS.component },
    // Suppliers
    { id: 'sk_hynix', label: 'SK Hynix', level: 'company', x: 650, y: 20, color: '#00FF9F' },
    { id: 'samsung', label: 'Samsung', level: 'company', x: 650, y: 60, color: '#00FF9F' },
    { id: 'tsmc', label: 'TSMC', level: 'company', x: 650, y: 120, color: '#00FF9F' },
  ],
  connections: [
    { from: 'ai_investment', to: 'nvidia', strength: 0.95, label: 'GPU Demand' },
    { from: 'ai_investment', to: 'amd', strength: 0.7, label: 'GPU Demand' },
    { from: 'nvidia', to: 'hbm', strength: 0.9, label: 'H100' },
    { from: 'nvidia', to: 'tsmc_fab', strength: 0.95, label: 'Wafer' },
    { from: 'nvidia', to: 'cowos', strength: 0.85, label: 'Packaging' },
    { from: 'amd', to: 'hbm', strength: 0.8, label: 'MI300' },
    { from: 'amd', to: 'tsmc_fab', strength: 0.9, label: 'Wafer' },
    { from: 'hbm', to: 'sk_hynix', strength: 0.95 },
    { from: 'hbm', to: 'samsung', strength: 0.7 },
    { from: 'tsmc_fab', to: 'tsmc', strength: 1.0 },
    { from: 'cowos', to: 'tsmc', strength: 1.0 },
  ],
};

// Theme 3: Trade War (Manufacturing & Export)
export const TRADE_WAR_THEME: SupplyChainTheme = {
  id: 'trade_war',
  name: 'Trade War',
  description: 'Tariff impact on manufacturing and export companies',
  icon: '⚔️',
  nodes: [
    // Macro
    { id: 'tariff', label: 'US Tariff', level: 'macro', x: 50, y: 80, color: LEVEL_COLORS.macro },
    { id: 'krw_usd', label: 'KRW/USD', level: 'macro', x: 50, y: 140, color: LEVEL_COLORS.macro },
    // Sectors
    { id: 'manufacturing', label: 'Manufacturing', level: 'sector', x: 270, y: 60, color: '#8B5CF6' },
    { id: 'automotive', label: 'Automotive', level: 'sector', x: 270, y: 120, color: '#F59E0B' },
    { id: 'steel', label: 'Steel', level: 'sector', x: 270, y: 180, color: '#64748B' },
    // Companies
    { id: 'hyundai', label: 'Hyundai Motor', level: 'company', x: 490, y: 40, color: '#F59E0B' },
    { id: 'kia', label: 'Kia', level: 'company', x: 490, y: 80, color: '#F59E0B' },
    { id: 'hyundai_steel', label: 'Hyundai Steel', level: 'company', x: 490, y: 140, color: '#64748B' },
    { id: 'posco', label: 'POSCO', level: 'company', x: 490, y: 180, color: '#64748B' },
  ],
  connections: [
    { from: 'tariff', to: 'manufacturing', strength: -0.7, label: 'Cost +' },
    { from: 'tariff', to: 'automotive', strength: -0.8, label: 'Export -' },
    { from: 'krw_usd', to: 'automotive', strength: 0.6, label: 'Weak KRW +' },
    { from: 'manufacturing', to: 'hyundai', strength: 0.8 },
    { from: 'automotive', to: 'hyundai', strength: 0.9 },
    { from: 'automotive', to: 'kia', strength: 0.85 },
    { from: 'steel', to: 'hyundai_steel', strength: 0.9 },
    { from: 'steel', to: 'posco', strength: 0.95 },
    { from: 'tariff', to: 'steel', strength: -0.6, label: 'Import Cost' },
  ],
};

// Theme 4: M2 Liquidity (Money Flow)
export const M2_LIQUIDITY_THEME: SupplyChainTheme = {
  id: 'm2_liquidity',
  name: 'M2 Liquidity',
  description: 'Money supply affecting various asset classes',
  icon: '💰',
  nodes: [
    // Macro
    { id: 'm2', label: 'US M2', level: 'macro', x: 50, y: 110, color: LEVEL_COLORS.macro },
    // Sectors
    { id: 'equity', label: 'Equity', level: 'sector', x: 250, y: 50, color: '#10B981' },
    { id: 'crypto', label: 'Crypto', level: 'sector', x: 250, y: 110, color: '#8B5CF6' },
    { id: 'real_assets', label: 'Real Assets', level: 'sector', x: 250, y: 170, color: '#F59E0B' },
    // Companies/Assets
    { id: 'sp500', label: 'S&P 500', level: 'company', x: 450, y: 30, color: '#10B981' },
    { id: 'nasdaq', label: 'NASDAQ', level: 'company', x: 450, y: 70, color: '#10B981' },
    { id: 'btc', label: 'Bitcoin', level: 'company', x: 450, y: 110, color: '#8B5CF6' },
    { id: 'eth', label: 'Ethereum', level: 'company', x: 450, y: 150, color: '#8B5CF6' },
    { id: 'gold', label: 'Gold', level: 'company', x: 450, y: 190, color: '#F59E0B' },
  ],
  connections: [
    { from: 'm2', to: 'equity', strength: 0.8, label: 'Liquidity +' },
    { from: 'm2', to: 'crypto', strength: 0.9, label: 'Risk On' },
    { from: 'm2', to: 'real_assets', strength: 0.6, label: 'Inflation Hedge' },
    { from: 'equity', to: 'sp500', strength: 0.95 },
    { from: 'equity', to: 'nasdaq', strength: 0.9 },
    { from: 'crypto', to: 'btc', strength: 0.95 },
    { from: 'crypto', to: 'eth', strength: 0.9 },
    { from: 'real_assets', to: 'gold', strength: 0.85 },
  ],
};

// All themes registry
export const SUPPLY_CHAIN_THEMES: Record<string, SupplyChainTheme> = {
  [FED_RATE_THEME.id]: FED_RATE_THEME,
  [AI_BOOM_THEME.id]: AI_BOOM_THEME,
  [TRADE_WAR_THEME.id]: TRADE_WAR_THEME,
  [M2_LIQUIDITY_THEME.id]: M2_LIQUIDITY_THEME,
};

export const getThemeById = (themeId: string): SupplyChainTheme => {
  return SUPPLY_CHAIN_THEMES[themeId] || FED_RATE_THEME;
};

export const getAllThemes = (): SupplyChainTheme[] => {
  return Object.values(SUPPLY_CHAIN_THEMES);
};
