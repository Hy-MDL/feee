/**
 * Markowitz Portfolio Optimization
 *
 * Mean-Variance Portfolio Theory (Nobel Prize 1990)
 * Calculates efficient frontier, optimal portfolios, and risk metrics
 */

/**
 * Matrix operations using simple linear algebra
 */

// Matrix multiplication
function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;

  const result: number[][] = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

// Matrix transpose
function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Calculate covariance matrix from returns
export function calculateCovarianceMatrix(returns: number[][]): number[][] {
  const numAssets = returns[0].length;
  const numPeriods = returns.length;

  // Calculate means
  const means = Array(numAssets).fill(0);
  for (let j = 0; j < numAssets; j++) {
    for (let i = 0; i < numPeriods; i++) {
      means[j] += returns[i][j];
    }
    means[j] /= numPeriods;
  }

  // Calculate covariance
  const cov: number[][] = Array(numAssets).fill(0).map(() => Array(numAssets).fill(0));

  for (let i = 0; i < numAssets; i++) {
    for (let j = 0; j < numAssets; j++) {
      let sum = 0;
      for (let k = 0; k < numPeriods; k++) {
        sum += (returns[k][i] - means[i]) * (returns[k][j] - means[j]);
      }
      cov[i][j] = sum / (numPeriods - 1);
    }
  }

  return cov;
}

/**
 * Portfolio statistics
 */
export interface PortfolioStats {
  returns: number;      // Expected return
  volatility: number;   // Standard deviation (risk)
  sharpeRatio: number;  // Risk-adjusted return
}

/**
 * Calculate portfolio expected return
 * E[R_p] = sum(w_i * E[R_i])
 */
export function portfolioReturn(weights: number[], expectedReturns: number[]): number {
  return weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
}

/**
 * Calculate portfolio variance
 * Var(R_p) = w^T * Σ * w
 */
export function portfolioVariance(weights: number[], covMatrix: number[][]): number {
  let variance = 0;
  const n = weights.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }

  return variance;
}

/**
 * Calculate portfolio volatility (standard deviation)
 */
export function portfolioVolatility(weights: number[], covMatrix: number[][]): number {
  return Math.sqrt(portfolioVariance(weights, covMatrix));
}

/**
 * Calculate Sharpe Ratio
 * Sharpe = (E[R_p] - R_f) / σ_p
 */
export function sharpeRatio(
  portfolioReturn: number,
  portfolioVolatility: number,
  riskFreeRate: number
): number {
  return (portfolioReturn - riskFreeRate) / portfolioVolatility;
}

/**
 * Calculate portfolio statistics
 */
export function calculatePortfolioStats(
  weights: number[],
  expectedReturns: number[],
  covMatrix: number[][],
  riskFreeRate: number
): PortfolioStats {
  const ret = portfolioReturn(weights, expectedReturns);
  const vol = portfolioVolatility(weights, covMatrix);
  const sharpe = sharpeRatio(ret, vol, riskFreeRate);

  return {
    returns: ret,
    volatility: vol,
    sharpeRatio: sharpe,
  };
}

/**
 * Random portfolio generation (for Monte Carlo simulation)
 */
export function generateRandomWeights(numAssets: number): number[] {
  // Generate random weights that sum to 1
  const weights = Array(numAssets).fill(0).map(() => Math.random());
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
}

/**
 * Generate efficient frontier using Monte Carlo simulation
 * Returns array of [return, volatility, weights, sharpeRatio] points
 */
export interface EfficientFrontierPoint {
  returns: number;
  volatility: number;
  weights: number[];
  sharpeRatio: number;
}

export function generateEfficientFrontier(
  expectedReturns: number[],
  covMatrix: number[][],
  riskFreeRate: number,
  numPortfolios: number = 10000
): EfficientFrontierPoint[] {
  const numAssets = expectedReturns.length;
  const portfolios: EfficientFrontierPoint[] = [];

  for (let i = 0; i < numPortfolios; i++) {
    const weights = generateRandomWeights(numAssets);
    const stats = calculatePortfolioStats(weights, expectedReturns, covMatrix, riskFreeRate);

    portfolios.push({
      returns: stats.returns,
      volatility: stats.volatility,
      weights: weights,
      sharpeRatio: stats.sharpeRatio,
    });
  }

  // Sort by volatility for plotting
  return portfolios.sort((a, b) => a.volatility - b.volatility);
}

/**
 * Find minimum variance portfolio
 * Simple approach: Among all generated portfolios, find the one with lowest volatility
 */
export function findMinimumVariancePortfolio(
  frontier: EfficientFrontierPoint[]
): EfficientFrontierPoint {
  return frontier.reduce((min, p) =>
    p.volatility < min.volatility ? p : min
  );
}

/**
 * Find tangency portfolio (maximum Sharpe ratio)
 * This is the optimal risky portfolio on the efficient frontier
 */
export function findTangencyPortfolio(
  frontier: EfficientFrontierPoint[]
): EfficientFrontierPoint {
  return frontier.reduce((max, p) =>
    p.sharpeRatio > max.sharpeRatio ? p : max
  );
}

/**
 * Equal Weight Portfolio (1/N strategy)
 * Simple but surprisingly effective benchmark
 */
export function equalWeightPortfolio(numAssets: number): number[] {
  return Array(numAssets).fill(1 / numAssets);
}

/**
 * Risk Parity Portfolio (simplified)
 * Each asset contributes equally to portfolio risk
 * Approximation: weights inversely proportional to volatility
 */
export function riskParityWeights(
  covMatrix: number[][]
): number[] {
  const numAssets = covMatrix.length;

  // Extract volatilities (diagonal of covariance matrix)
  const volatilities = covMatrix.map((row, i) => Math.sqrt(row[i]));

  // Inverse volatility weights
  const inverseVols = volatilities.map(v => 1 / v);
  const sum = inverseVols.reduce((a, b) => a + b, 0);

  return inverseVols.map(iv => iv / sum);
}

/**
 * Market Cap Weighted Portfolio
 * Weights proportional to market capitalization
 */
export function marketCapWeights(marketCaps: number[]): number[] {
  const totalCap = marketCaps.reduce((a, b) => a + b, 0);
  return marketCaps.map(cap => cap / totalCap);
}

/**
 * Calculate Maximum Drawdown
 * Maximum peak-to-trough decline
 */
export function maxDrawdown(cumulativeReturns: number[]): number {
  let maxDD = 0;
  let peak = cumulativeReturns[0];

  for (const value of cumulativeReturns) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    maxDD = Math.max(maxDD, drawdown);
  }

  return maxDD;
}

/**
 * Calculate Sortino Ratio
 * Like Sharpe, but only penalizes downside volatility
 */
export function sortinoRatio(
  returns: number[],
  riskFreeRate: number,
  targetReturn: number = 0
): number {
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Downside deviation (only negative returns relative to target)
  const downsideReturns = returns.filter(r => r < targetReturn);
  if (downsideReturns.length === 0) return Infinity;

  const downsideVariance = downsideReturns.reduce((sum, r) =>
    sum + Math.pow(r - targetReturn, 2), 0
  ) / downsideReturns.length;

  const downsideDeviation = Math.sqrt(downsideVariance);

  return (avgReturn - riskFreeRate) / downsideDeviation;
}

/**
 * Calculate Calmar Ratio
 * Return / Maximum Drawdown
 */
export function calmarRatio(
  avgReturn: number,
  cumulativeReturns: number[]
): number {
  const maxDD = maxDrawdown(cumulativeReturns);
  return maxDD === 0 ? Infinity : avgReturn / maxDD;
}

/**
 * Calculate portfolio Beta
 * Covariance(portfolio, market) / Variance(market)
 */
export function portfolioBeta(
  portfolioReturns: number[],
  marketReturns: number[]
): number {
  const n = portfolioReturns.length;

  // Calculate means
  const meanPort = portfolioReturns.reduce((a, b) => a + b, 0) / n;
  const meanMkt = marketReturns.reduce((a, b) => a + b, 0) / n;

  // Calculate covariance and variance
  let covariance = 0;
  let marketVariance = 0;

  for (let i = 0; i < n; i++) {
    const portDev = portfolioReturns[i] - meanPort;
    const mktDev = marketReturns[i] - meanMkt;

    covariance += portDev * mktDev;
    marketVariance += mktDev * mktDev;
  }

  covariance /= n;
  marketVariance /= n;

  return marketVariance === 0 ? 0 : covariance / marketVariance;
}

/**
 * Calculate portfolio Alpha (CAPM)
 * Alpha = R_p - [R_f + Beta * (R_m - R_f)]
 */
export function portfolioAlpha(
  portfolioReturn: number,
  marketReturn: number,
  riskFreeRate: number,
  beta: number
): number {
  const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
  return portfolioReturn - expectedReturn;
}

/**
 * Calculate tracking error
 * Standard deviation of difference between portfolio and benchmark returns
 */
export function trackingError(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  const n = portfolioReturns.length;
  const differences = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);

  const mean = differences.reduce((a, b) => a + b, 0) / n;
  const variance = differences.reduce((sum, d) =>
    sum + Math.pow(d - mean, 2), 0
  ) / (n - 1);

  return Math.sqrt(variance);
}

/**
 * Calculate Information Ratio
 * (Portfolio Return - Benchmark Return) / Tracking Error
 */
export function informationRatio(
  portfolioReturn: number,
  benchmarkReturn: number,
  trackingError: number
): number {
  return trackingError === 0 ? 0 : (portfolioReturn - benchmarkReturn) / trackingError;
}

/**
 * Asset allocation constraints
 */
export interface AllocationConstraints {
  minWeight?: number;  // Minimum weight per asset (e.g., 0 for no short selling)
  maxWeight?: number;  // Maximum weight per asset (e.g., 0.4 for 40% max)
  targetReturn?: number; // Target return constraint
}

/**
 * Apply constraints to weights
 */
export function applyConstraints(
  weights: number[],
  constraints: AllocationConstraints
): number[] {
  let adjusted = [...weights];

  // Apply min/max constraints
  if (constraints.minWeight !== undefined) {
    adjusted = adjusted.map(w => Math.max(w, constraints.minWeight!));
  }
  if (constraints.maxWeight !== undefined) {
    adjusted = adjusted.map(w => Math.min(w, constraints.maxWeight!));
  }

  // Renormalize to sum to 1
  const sum = adjusted.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    adjusted = adjusted.map(w => w / sum);
  }

  return adjusted;
}

/**
 * Example: Calculate correlation matrix from covariance matrix
 */
export function covarianceToCorrelation(covMatrix: number[][]): number[][] {
  const n = covMatrix.length;
  const corr: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  // Get standard deviations (sqrt of diagonal)
  const stdDevs = covMatrix.map((row, i) => Math.sqrt(row[i]));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      corr[i][j] = covMatrix[i][j] / (stdDevs[i] * stdDevs[j]);
    }
  }

  return corr;
}

/**
 * Sample data generation for testing
 */
export function generateSampleReturns(
  numAssets: number,
  numPeriods: number,
  meanReturn: number = 0.08,
  volatility: number = 0.15
): { returns: number[][], expectedReturns: number[], covMatrix: number[][] } {
  const returns: number[][] = [];

  for (let t = 0; t < numPeriods; t++) {
    const period: number[] = [];
    for (let i = 0; i < numAssets; i++) {
      // Simple random returns (not realistic, but for testing)
      const r = meanReturn / 12 + volatility / Math.sqrt(12) * (Math.random() - 0.5) * 2;
      period.push(r);
    }
    returns.push(period);
  }

  // Calculate expected returns (sample means)
  const expectedReturns = Array(numAssets).fill(0);
  for (let i = 0; i < numAssets; i++) {
    for (let t = 0; t < numPeriods; t++) {
      expectedReturns[i] += returns[t][i];
    }
    expectedReturns[i] /= numPeriods;
  }

  const covMatrix = calculateCovarianceMatrix(returns);

  return { returns, expectedReturns, covMatrix };
}
