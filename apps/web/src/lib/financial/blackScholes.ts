/**
 * Black-Scholes Option Pricing Model
 *
 * The Black-Scholes-Merton model for European option pricing
 * Assumptions:
 * - European options (exercise only at expiration)
 * - No dividends
 * - Constant risk-free rate and volatility
 * - Log-normal distribution of stock prices
 * - No transaction costs
 */

/**
 * Standard normal cumulative distribution function
 * Approximation using Hart's algorithm
 */
function cumulativeNormal(x: number): number {
  const a1 = 0.31938153;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const L = Math.abs(x);
  const K = 1.0 / (1.0 + 0.2316419 * L);
  const w = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) *
    Math.exp(-0.5 * L * L) *
    (a1 * K + a2 * K * K + a3 * K * K * K + a4 * K * K * K * K + a5 * K * K * K * K * K);

  return x < 0 ? 1.0 - w : w;
}

/**
 * Standard normal probability density function
 */
function normalPDF(x: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/**
 * Calculate d1 parameter in Black-Scholes formula
 */
function d1(S: number, K: number, T: number, r: number, sigma: number): number {
  return (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
}

/**
 * Calculate d2 parameter in Black-Scholes formula
 */
function d2(S: number, K: number, T: number, r: number, sigma: number): number {
  return d1(S, K, T, r, sigma) - sigma * Math.sqrt(T);
}

/**
 * Black-Scholes Call Option Price
 *
 * @param S - Current stock price
 * @param K - Strike price
 * @param T - Time to expiration (in years)
 * @param r - Risk-free interest rate (annual)
 * @param sigma - Volatility (annual standard deviation)
 * @returns Call option price
 */
export function callPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return Math.max(0, S - K);

  const d1Val = d1(S, K, T, r, sigma);
  const d2Val = d2(S, K, T, r, sigma);

  return S * cumulativeNormal(d1Val) - K * Math.exp(-r * T) * cumulativeNormal(d2Val);
}

/**
 * Black-Scholes Put Option Price
 *
 * @param S - Current stock price
 * @param K - Strike price
 * @param T - Time to expiration (in years)
 * @param r - Risk-free interest rate (annual)
 * @param sigma - Volatility (annual standard deviation)
 * @returns Put option price
 */
export function putPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return Math.max(0, K - S);

  const d1Val = d1(S, K, T, r, sigma);
  const d2Val = d2(S, K, T, r, sigma);

  return K * Math.exp(-r * T) * cumulativeNormal(-d2Val) - S * cumulativeNormal(-d1Val);
}

/**
 * Greeks: First-order and second-order derivatives
 */

/**
 * Delta: Rate of change of option price with respect to stock price
 * Call Delta: N(d1)
 * Put Delta: -N(-d1) = N(d1) - 1
 */
export function delta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: 'call' | 'put'
): number {
  if (T <= 0) {
    if (type === 'call') return S > K ? 1 : 0;
    return S < K ? -1 : 0;
  }

  const d1Val = d1(S, K, T, r, sigma);
  const callDelta = cumulativeNormal(d1Val);

  return type === 'call' ? callDelta : callDelta - 1;
}

/**
 * Gamma: Rate of change of delta with respect to stock price
 * Gamma is the same for both call and put options
 * Gamma = N'(d1) / (S * sigma * sqrt(T))
 */
export function gamma(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;

  const d1Val = d1(S, K, T, r, sigma);
  return normalPDF(d1Val) / (S * sigma * Math.sqrt(T));
}

/**
 * Vega: Rate of change of option price with respect to volatility
 * Vega is the same for both call and put options
 * Vega = S * N'(d1) * sqrt(T)
 *
 * Note: Vega is usually expressed per 1% change in volatility
 */
export function vega(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
): number {
  if (T <= 0) return 0;

  const d1Val = d1(S, K, T, r, sigma);
  return S * normalPDF(d1Val) * Math.sqrt(T) / 100; // Per 1% change
}

/**
 * Theta: Rate of change of option price with respect to time
 * Theta measures time decay (usually negative)
 *
 * Call Theta = -(S * N'(d1) * sigma) / (2 * sqrt(T)) - r * K * exp(-r * T) * N(d2)
 * Put Theta = -(S * N'(d1) * sigma) / (2 * sqrt(T)) + r * K * exp(-r * T) * N(-d2)
 *
 * Note: Theta is usually expressed per day (divide by 365)
 */
export function theta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: 'call' | 'put'
): number {
  if (T <= 0) return 0;

  const d1Val = d1(S, K, T, r, sigma);
  const d2Val = d2(S, K, T, r, sigma);

  const term1 = -(S * normalPDF(d1Val) * sigma) / (2 * Math.sqrt(T));

  if (type === 'call') {
    const term2 = -r * K * Math.exp(-r * T) * cumulativeNormal(d2Val);
    return (term1 + term2) / 365; // Per day
  } else {
    const term2 = r * K * Math.exp(-r * T) * cumulativeNormal(-d2Val);
    return (term1 + term2) / 365; // Per day
  }
}

/**
 * Rho: Rate of change of option price with respect to risk-free rate
 *
 * Call Rho = K * T * exp(-r * T) * N(d2)
 * Put Rho = -K * T * exp(-r * T) * N(-d2)
 *
 * Note: Rho is usually expressed per 1% change in interest rate
 */
export function rho(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: 'call' | 'put'
): number {
  if (T <= 0) return 0;

  const d2Val = d2(S, K, T, r, sigma);

  if (type === 'call') {
    return K * T * Math.exp(-r * T) * cumulativeNormal(d2Val) / 100; // Per 1%
  } else {
    return -K * T * Math.exp(-r * T) * cumulativeNormal(-d2Val) / 100; // Per 1%
  }
}

/**
 * Calculate all Greeks at once
 */
export interface Greeks {
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
}

export function calculateGreeks(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: 'call' | 'put'
): Greeks {
  return {
    delta: delta(S, K, T, r, sigma, type),
    gamma: gamma(S, K, T, r, sigma),
    vega: vega(S, K, T, r, sigma),
    theta: theta(S, K, T, r, sigma, type),
    rho: rho(S, K, T, r, sigma, type),
  };
}

/**
 * Implied Volatility using Newton-Raphson method
 *
 * @param marketPrice - Observed market price of the option
 * @param S - Current stock price
 * @param K - Strike price
 * @param T - Time to expiration (in years)
 * @param r - Risk-free interest rate
 * @param type - 'call' or 'put'
 * @param initialGuess - Initial guess for volatility (default: 0.5)
 * @param maxIterations - Maximum iterations (default: 100)
 * @param tolerance - Convergence tolerance (default: 1e-6)
 * @returns Implied volatility
 */
export function impliedVolatility(
  marketPrice: number,
  S: number,
  K: number,
  T: number,
  r: number,
  type: 'call' | 'put',
  initialGuess: number = 0.5,
  maxIterations: number = 100,
  tolerance: number = 1e-6
): number | null {
  if (T <= 0) return null;

  let sigma = initialGuess;

  for (let i = 0; i < maxIterations; i++) {
    const price = type === 'call'
      ? callPrice(S, K, T, r, sigma)
      : putPrice(S, K, T, r, sigma);

    const vegaVal = vega(S, K, T, r, sigma) * 100; // Remove the /100 scaling

    if (Math.abs(vegaVal) < 1e-10) {
      // Vega too small, cannot converge
      return null;
    }

    const diff = price - marketPrice;

    if (Math.abs(diff) < tolerance) {
      return sigma;
    }

    // Newton-Raphson update
    sigma = sigma - diff / vegaVal;

    // Keep sigma positive
    if (sigma <= 0) {
      sigma = initialGuess / 2;
    }
  }

  // Did not converge
  return null;
}

/**
 * Option pricing with dividends (Merton's extension)
 *
 * @param S - Current stock price
 * @param K - Strike price
 * @param T - Time to expiration
 * @param r - Risk-free rate
 * @param sigma - Volatility
 * @param q - Continuous dividend yield
 * @param type - 'call' or 'put'
 */
export function optionPriceWithDividends(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number,
  type: 'call' | 'put'
): number {
  // Adjust stock price for dividends
  const S_adjusted = S * Math.exp(-q * T);

  return type === 'call'
    ? callPrice(S_adjusted, K, T, r, sigma)
    : putPrice(S_adjusted, K, T, r, sigma);
}

/**
 * Put-Call Parity check
 * C - P = S - K * exp(-r * T)
 *
 * Returns the difference (should be close to zero for correctly priced options)
 */
export function putCallParity(
  callPrice: number,
  putPrice: number,
  S: number,
  K: number,
  T: number,
  r: number
): number {
  const leftSide = callPrice - putPrice;
  const rightSide = S - K * Math.exp(-r * T);
  return leftSide - rightSide;
}

/**
 * Example usage and test cases
 */
export const TEST_CASES = {
  // Standard example
  standard: {
    S: 100,
    K: 100,
    T: 1,
    r: 0.05,
    sigma: 0.2,
  },

  // In-the-money call
  itmCall: {
    S: 110,
    K: 100,
    T: 0.5,
    r: 0.05,
    sigma: 0.25,
  },

  // Out-of-the-money put
  otmPut: {
    S: 100,
    K: 90,
    T: 0.25,
    r: 0.03,
    sigma: 0.3,
  },

  // High volatility
  highVol: {
    S: 50,
    K: 50,
    T: 2,
    r: 0.04,
    sigma: 0.6,
  },
};

/**
 * Helper: Calculate intrinsic value
 */
export function intrinsicValue(S: number, K: number, type: 'call' | 'put'): number {
  return type === 'call'
    ? Math.max(0, S - K)
    : Math.max(0, K - S);
}

/**
 * Helper: Calculate time value
 */
export function timeValue(
  optionPrice: number,
  S: number,
  K: number,
  type: 'call' | 'put'
): number {
  return optionPrice - intrinsicValue(S, K, type);
}

/**
 * Helper: Determine if option is ITM, ATM, or OTM
 */
export function moneyness(S: number, K: number, type: 'call' | 'put'): 'ITM' | 'ATM' | 'OTM' {
  const threshold = 0.01; // 1% threshold for ATM
  const ratio = S / K;

  if (type === 'call') {
    if (ratio > 1 + threshold) return 'ITM';
    if (ratio < 1 - threshold) return 'OTM';
    return 'ATM';
  } else {
    if (ratio < 1 - threshold) return 'ITM';
    if (ratio > 1 + threshold) return 'OTM';
    return 'ATM';
  }
}
