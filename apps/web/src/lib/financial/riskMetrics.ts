/**
 * Risk Management Metrics
 *
 * VaR, CVaR, Expected Shortfall, Stress Testing
 * Industry-standard risk measurement tools
 */

/**
 * Value at Risk (VaR) - Historical Method
 *
 * The maximum expected loss over a given time period at a specific confidence level
 * Historical VaR uses actual historical returns
 *
 * @param returns - Array of historical returns
 * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns VaR value (positive number representing loss)
 */
export function historicalVaR(returns: number[], confidenceLevel: number): number {
  if (returns.length === 0) return 0;

  // Sort returns in ascending order (worst losses first)
  const sortedReturns = [...returns].sort((a, b) => a - b);

  // Find the return at the (1 - confidence level) percentile
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  const var95 = -sortedReturns[index]; // Convert to positive loss

  return var95;
}

/**
 * Parametric VaR (Variance-Covariance Method)
 *
 * Assumes returns are normally distributed
 * VaR = μ - z * σ
 *
 * @param mean - Expected return
 * @param stdDev - Standard deviation
 * @param confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns VaR value
 */
export function parametricVaR(
  mean: number,
  stdDev: number,
  confidenceLevel: number
): number {
  // Get z-score for confidence level
  const zScore = inverseNormalCDF(confidenceLevel);

  // VaR = -μ + z * σ (for losses)
  const var95 = -(mean - zScore * stdDev);

  return Math.max(0, var95);
}

/**
 * Monte Carlo VaR
 *
 * Simulates future portfolio values using random sampling
 *
 * @param mean - Expected return
 * @param stdDev - Standard deviation
 * @param numSimulations - Number of Monte Carlo simulations
 * @param confidenceLevel - Confidence level
 * @returns VaR value
 */
export function monteCarloVaR(
  mean: number,
  stdDev: number,
  numSimulations: number,
  confidenceLevel: number
): number {
  const simulations: number[] = [];

  // Generate random returns
  for (let i = 0; i < numSimulations; i++) {
    const randomReturn = normalRandom(mean, stdDev);
    simulations.push(randomReturn);
  }

  // Use historical VaR on simulated returns
  return historicalVaR(simulations, confidenceLevel);
}

/**
 * Conditional Value at Risk (CVaR) / Expected Shortfall (ES)
 *
 * Average of all losses beyond VaR threshold
 * Measures tail risk better than VaR
 *
 * @param returns - Array of historical returns
 * @param confidenceLevel - Confidence level
 * @returns CVaR value (Expected Shortfall)
 */
export function conditionalVaR(returns: number[], confidenceLevel: number): number {
  if (returns.length === 0) return 0;

  // Sort returns
  const sortedReturns = [...returns].sort((a, b) => a - b);

  // Find VaR threshold
  const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);

  // Average all losses beyond VaR
  const tailLosses = sortedReturns.slice(0, varIndex + 1);
  const cvar = -tailLosses.reduce((sum, r) => sum + r, 0) / tailLosses.length;

  return cvar;
}

/**
 * Portfolio VaR
 *
 * VaR for a portfolio with multiple assets
 *
 * @param weights - Portfolio weights
 * @param means - Expected returns for each asset
 * @param covMatrix - Covariance matrix
 * @param confidenceLevel - Confidence level
 * @returns Portfolio VaR
 */
export function portfolioVaR(
  weights: number[],
  means: number[],
  covMatrix: number[][],
  confidenceLevel: number
): number {
  // Portfolio expected return
  const portfolioMean = weights.reduce((sum, w, i) => sum + w * means[i], 0);

  // Portfolio variance: w^T * Σ * w
  let portfolioVariance = 0;
  const n = weights.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      portfolioVariance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }

  const portfolioStdDev = Math.sqrt(portfolioVariance);

  // Use parametric VaR
  return parametricVaR(portfolioMean, portfolioStdDev, confidenceLevel);
}

/**
 * Marginal VaR
 *
 * Change in portfolio VaR from a small change in position size
 * ∂VaR/∂w_i
 *
 * @param weights - Current portfolio weights
 * @param means - Expected returns
 * @param covMatrix - Covariance matrix
 * @param confidenceLevel - Confidence level
 * @returns Array of marginal VaRs for each asset
 */
export function marginalVaR(
  weights: number[],
  means: number[],
  covMatrix: number[][],
  confidenceLevel: number
): number[] {
  const n = weights.length;
  const marginalVars: number[] = [];

  // Small perturbation
  const epsilon = 0.0001;

  // Base VaR
  const baseVar = portfolioVaR(weights, means, covMatrix, confidenceLevel);

  for (let i = 0; i < n; i++) {
    // Increase weight i slightly
    const perturbedWeights = [...weights];
    perturbedWeights[i] += epsilon;

    // Calculate new VaR
    const newVar = portfolioVaR(perturbedWeights, means, covMatrix, confidenceLevel);

    // Marginal VaR = (new VaR - base VaR) / epsilon
    const marginal = (newVar - baseVar) / epsilon;
    marginalVars.push(marginal);
  }

  return marginalVars;
}

/**
 * Component VaR
 *
 * Contribution of each asset to total portfolio VaR
 * Component VaR_i = w_i * Marginal VaR_i
 *
 * @param weights - Portfolio weights
 * @param means - Expected returns
 * @param covMatrix - Covariance matrix
 * @param confidenceLevel - Confidence level
 * @returns Array of component VaRs (sum = portfolio VaR)
 */
export function componentVaR(
  weights: number[],
  means: number[],
  covMatrix: number[][],
  confidenceLevel: number
): number[] {
  const marginalVars = marginalVaR(weights, means, covMatrix, confidenceLevel);

  // Component VaR = weight * marginal VaR
  return weights.map((w, i) => w * marginalVars[i]);
}

/**
 * Incremental VaR
 *
 * Change in portfolio VaR from adding/removing a position
 *
 * @param weights - Current portfolio weights
 * @param assetIndex - Index of asset to add/remove
 * @param incrementalWeight - Weight to add (positive) or remove (negative)
 * @param means - Expected returns
 * @param covMatrix - Covariance matrix
 * @param confidenceLevel - Confidence level
 * @returns Change in VaR
 */
export function incrementalVaR(
  weights: number[],
  assetIndex: number,
  incrementalWeight: number,
  means: number[],
  covMatrix: number[][],
  confidenceLevel: number
): number {
  // Current VaR
  const currentVar = portfolioVaR(weights, means, covMatrix, confidenceLevel);

  // New weights
  const newWeights = [...weights];
  newWeights[assetIndex] += incrementalWeight;

  // New VaR
  const newVar = portfolioVaR(newWeights, means, covMatrix, confidenceLevel);

  // Incremental VaR
  return newVar - currentVar;
}

/**
 * Stress Testing
 *
 * Test portfolio performance under extreme scenarios
 */

export interface StressScenario {
  name: string;
  description: string;
  shocks: number[]; // Return shock for each asset (e.g., -0.30 = -30% drop)
}

export interface StressTestResult {
  scenario: StressScenario;
  portfolioLoss: number; // Total portfolio loss
  percentageLoss: number; // Loss as % of portfolio
  componentLosses: number[]; // Loss contribution by asset
}

/**
 * Run stress test on portfolio
 *
 * @param weights - Portfolio weights
 * @param scenario - Stress scenario
 * @param assetNames - Names of assets
 * @returns Stress test results
 */
export function runStressTest(
  weights: number[],
  scenario: StressScenario,
  assetNames?: string[]
): StressTestResult {
  // Calculate portfolio loss
  let portfolioLoss = 0;
  const componentLosses: number[] = [];

  for (let i = 0; i < weights.length; i++) {
    const loss = weights[i] * scenario.shocks[i];
    componentLosses.push(loss);
    portfolioLoss += loss;
  }

  return {
    scenario,
    portfolioLoss,
    percentageLoss: portfolioLoss * 100,
    componentLosses,
  };
}

/**
 * Predefined stress scenarios
 */
export const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: '2008 Financial Crisis',
    description: 'Global financial crisis - severe equity market decline',
    shocks: [-0.38, -0.45, -0.12, -0.35], // Stocks, Tech, Bonds, Real Estate
  },
  {
    name: '2020 COVID-19 Crash',
    description: 'Pandemic-induced market crash',
    shocks: [-0.34, -0.30, -0.08, -0.28],
  },
  {
    name: 'Interest Rate Shock',
    description: 'Sudden 3% rate hike',
    shocks: [-0.15, -0.20, -0.25, -0.18],
  },
  {
    name: 'Tech Bubble Burst',
    description: 'Technology sector collapse',
    shocks: [-0.25, -0.50, -0.05, -0.15],
  },
  {
    name: 'Inflation Spike',
    description: 'Rapid inflation acceleration',
    shocks: [-0.18, -0.22, -0.30, -0.12],
  },
];

/**
 * Maximum Drawdown Period
 *
 * Identifies the worst peak-to-trough decline period
 */
export interface DrawdownPeriod {
  startIndex: number;
  endIndex: number;
  startValue: number;
  endValue: number;
  drawdown: number; // Percentage decline
  duration: number; // Number of periods
}

/**
 * Find maximum drawdown period
 *
 * @param cumulativeReturns - Array of cumulative return values
 * @returns Maximum drawdown period details
 */
export function findMaxDrawdownPeriod(cumulativeReturns: number[]): DrawdownPeriod {
  let maxDD = 0;
  let peak = cumulativeReturns[0];
  let peakIndex = 0;
  let troughIndex = 0;
  let maxPeakIndex = 0;
  let maxTroughIndex = 0;

  for (let i = 0; i < cumulativeReturns.length; i++) {
    const value = cumulativeReturns[i];

    if (value > peak) {
      peak = value;
      peakIndex = i;
    }

    const drawdown = (peak - value) / peak;

    if (drawdown > maxDD) {
      maxDD = drawdown;
      maxPeakIndex = peakIndex;
      maxTroughIndex = i;
    }
  }

  return {
    startIndex: maxPeakIndex,
    endIndex: maxTroughIndex,
    startValue: cumulativeReturns[maxPeakIndex],
    endValue: cumulativeReturns[maxTroughIndex],
    drawdown: maxDD,
    duration: maxTroughIndex - maxPeakIndex,
  };
}

/**
 * Value at Risk Attribution
 *
 * Break down portfolio VaR by asset, sector, or factor
 */
export interface VaRAttribution {
  assetName: string;
  weight: number;
  componentVar: number;
  percentageContribution: number; // % of total VaR
  marginalVar: number;
}

/**
 * Calculate VaR attribution for each asset
 *
 * @param weights - Portfolio weights
 * @param assetNames - Names of assets
 * @param means - Expected returns
 * @param covMatrix - Covariance matrix
 * @param confidenceLevel - Confidence level
 * @returns VaR attribution breakdown
 */
export function varAttribution(
  weights: number[],
  assetNames: string[],
  means: number[],
  covMatrix: number[][],
  confidenceLevel: number
): VaRAttribution[] {
  const portfolioVar = portfolioVaR(weights, means, covMatrix, confidenceLevel);
  const componentVars = componentVaR(weights, means, covMatrix, confidenceLevel);
  const marginalVars = marginalVaR(weights, means, covMatrix, confidenceLevel);

  return assetNames.map((name, i) => ({
    assetName: name,
    weight: weights[i],
    componentVar: componentVars[i],
    percentageContribution: (componentVars[i] / portfolioVar) * 100,
    marginalVar: marginalVars[i],
  }));
}

/**
 * Expected Shortfall (Alternative calculation)
 *
 * Using parametric method
 */
export function parametricExpectedShortfall(
  mean: number,
  stdDev: number,
  confidenceLevel: number
): number {
  // Get VaR
  const var95 = parametricVaR(mean, stdDev, confidenceLevel);

  // For normal distribution, ES = VaR + σ * φ(z) / (1 - α)
  const zScore = inverseNormalCDF(confidenceLevel);
  const phi = normalPDF(zScore);

  const es = var95 + (stdDev * phi) / (1 - confidenceLevel);

  return es;
}

/**
 * Liquidity-Adjusted VaR
 *
 * Adjusts VaR for illiquid positions
 *
 * @param baseVar - Base VaR
 * @param liquidityHorizon - Days to liquidate position
 * @param varHorizon - VaR calculation horizon (days)
 * @returns Liquidity-adjusted VaR
 */
export function liquidityAdjustedVaR(
  baseVar: number,
  liquidityHorizon: number,
  varHorizon: number = 1
): number {
  // Scale VaR by square root of time
  // LVaR = VaR * sqrt(liquidityHorizon / varHorizon)
  return baseVar * Math.sqrt(liquidityHorizon / varHorizon);
}

/**
 * Volatility Scaling
 *
 * Scale VaR across different time horizons
 *
 * @param var1Day - 1-day VaR
 * @param horizonDays - Target horizon in days
 * @returns Scaled VaR
 */
export function scaleVaR(var1Day: number, horizonDays: number): number {
  // VaR(T) = VaR(1) * sqrt(T)
  return var1Day * Math.sqrt(horizonDays);
}

/**
 * Coherent Risk Measure Check
 *
 * VaR is NOT coherent (fails subadditivity)
 * CVaR/ES IS coherent
 */
export function isCoherentRiskMeasure(measureName: string): boolean {
  const coherentMeasures = ['CVaR', 'ES', 'Expected Shortfall', 'TCE'];
  return coherentMeasures.includes(measureName);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Inverse Normal CDF (Cumulative Distribution Function)
 *
 * Approximation for z-score calculation
 */
function inverseNormalCDF(p: number): number {
  // Beasley-Springer-Moro algorithm approximation
  const a = [
    -39.6968302866538, 220.946098424521, -275.928510446969,
    138.357751867269, -30.6647980661472, 2.50662827745924,
  ];
  const b = [
    -54.4760987982241, 161.585836858041, -155.698979859887,
    66.8013118877197, -13.2806815528857,
  ];
  const c = [
    -0.00778489400243029, -0.322396458041136, -2.40075827716184,
    -2.54973253934373, 4.37466414146497, 2.93816398269878,
  ];
  const d = [
    0.00778469570904146, 0.32246712907004, 2.445134137143,
    3.75440866190742,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number, z: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return z;
}

/**
 * Normal PDF (Probability Density Function)
 */
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Generate random normal variable (Box-Muller transform)
 */
function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();

  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  return mean + stdDev * z0;
}

/**
 * Rolling VaR
 *
 * Calculate VaR over rolling windows
 *
 * @param returns - Time series of returns
 * @param windowSize - Size of rolling window
 * @param confidenceLevel - Confidence level
 * @returns Array of rolling VaR values
 */
export function rollingVaR(
  returns: number[],
  windowSize: number,
  confidenceLevel: number
): number[] {
  const rollingVars: number[] = [];

  for (let i = windowSize; i <= returns.length; i++) {
    const window = returns.slice(i - windowSize, i);
    const var95 = historicalVaR(window, confidenceLevel);
    rollingVars.push(var95);
  }

  return rollingVars;
}

/**
 * Backtesting VaR
 *
 * Test if VaR model is accurate
 */
export interface VaRBacktest {
  numExceedances: number; // Number of times loss exceeded VaR
  expectedExceedances: number;
  exceedanceRate: number; // Actual exceedance rate
  expectedRate: number; // Theoretical rate (1 - confidence level)
  isValid: boolean; // Pass/fail based on exceedance rate
}

/**
 * Backtest VaR model
 *
 * @param returns - Actual returns
 * @param varEstimates - VaR estimates for each period
 * @param confidenceLevel - Confidence level used
 * @returns Backtest results
 */
export function backtestVaR(
  returns: number[],
  varEstimates: number[],
  confidenceLevel: number
): VaRBacktest {
  let numExceedances = 0;

  // Count how many times actual loss exceeded VaR
  for (let i = 0; i < returns.length; i++) {
    const loss = -returns[i]; // Convert return to loss
    if (loss > varEstimates[i]) {
      numExceedances++;
    }
  }

  const expectedRate = 1 - confidenceLevel;
  const expectedExceedances = returns.length * expectedRate;
  const exceedanceRate = numExceedances / returns.length;

  // Simple validation: exceedance rate should be close to expected rate
  // Allow ±20% deviation
  const isValid = Math.abs(exceedanceRate - expectedRate) / expectedRate < 0.2;

  return {
    numExceedances,
    expectedExceedances,
    exceedanceRate,
    expectedRate,
    isValid,
  };
}
