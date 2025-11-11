/**
 * Fixed Income Analytics
 *
 * Bond pricing, yield curves, duration, convexity
 * Core fixed income mathematics
 */

/**
 * Bond Cash Flow
 */
export interface BondCashFlow {
  time: number; // Time in years
  amount: number; // Cash flow amount
  type: 'coupon' | 'principal';
}

/**
 * Bond Specifications
 */
export interface BondSpec {
  faceValue: number; // Par value (typically 1000)
  couponRate: number; // Annual coupon rate (e.g., 0.05 for 5%)
  maturity: number; // Years to maturity
  frequency: number; // Payments per year (1=annual, 2=semi-annual, 4=quarterly)
  yieldToMaturity?: number; // YTM (if known)
}

/**
 * Bond Price
 *
 * Present value of all future cash flows
 * Price = Σ (CF_t / (1 + y)^t)
 *
 * @param faceValue - Par value
 * @param couponRate - Annual coupon rate
 * @param maturity - Years to maturity
 * @param yieldToMaturity - Required yield
 * @param frequency - Payments per year
 * @returns Bond price
 */
export function bondPrice(
  faceValue: number,
  couponRate: number,
  maturity: number,
  yieldToMaturity: number,
  frequency: number = 2
): number {
  const n = maturity * frequency; // Total number of periods
  const c = (faceValue * couponRate) / frequency; // Coupon payment per period
  const y = yieldToMaturity / frequency; // Yield per period

  if (yieldToMaturity === 0) {
    // No discounting
    return faceValue + c * n;
  }

  // Present value of coupon payments
  let pvCoupons = 0;
  for (let t = 1; t <= n; t++) {
    pvCoupons += c / Math.pow(1 + y, t);
  }

  // Present value of principal
  const pvPrincipal = faceValue / Math.pow(1 + y, n);

  return pvCoupons + pvPrincipal;
}

/**
 * Bond Price (Alternative formula using annuity)
 *
 * More efficient for standard bonds
 */
export function bondPriceAnnuity(
  faceValue: number,
  couponRate: number,
  maturity: number,
  yieldToMaturity: number,
  frequency: number = 2
): number {
  const n = maturity * frequency;
  const c = (faceValue * couponRate) / frequency;
  const y = yieldToMaturity / frequency;

  if (yieldToMaturity === 0) {
    return faceValue + c * n;
  }

  // Annuity formula for coupon PV
  const pvCoupons = c * ((1 - Math.pow(1 + y, -n)) / y);

  // Principal PV
  const pvPrincipal = faceValue / Math.pow(1 + y, n);

  return pvCoupons + pvPrincipal;
}

/**
 * Yield to Maturity (YTM)
 *
 * Internal rate of return on a bond
 * Solved using Newton-Raphson method
 *
 * @param price - Current bond price
 * @param faceValue - Par value
 * @param couponRate - Annual coupon rate
 * @param maturity - Years to maturity
 * @param frequency - Payments per year
 * @returns YTM (annual)
 */
export function yieldToMaturity(
  price: number,
  faceValue: number,
  couponRate: number,
  maturity: number,
  frequency: number = 2,
  initialGuess: number = 0.05
): number {
  const tolerance = 0.0001;
  const maxIterations = 100;

  let y = initialGuess;

  for (let i = 0; i < maxIterations; i++) {
    const priceCalc = bondPrice(faceValue, couponRate, maturity, y, frequency);
    const diff = priceCalc - price;

    if (Math.abs(diff) < tolerance) {
      return y;
    }

    // Calculate derivative (bond duration scaled by price)
    const duration = macaulayDuration(faceValue, couponRate, maturity, y, frequency);
    const dPricedy = -priceCalc * duration / (1 + y / frequency);

    // Newton-Raphson update
    y = y - diff / dPricedy;

    // Keep yield positive
    if (y < 0) y = 0.001;
  }

  return y;
}

/**
 * Macaulay Duration
 *
 * Weighted average time to receive bond cash flows
 * Duration = Σ (t * PV(CF_t)) / Price
 *
 * @returns Duration in years
 */
export function macaulayDuration(
  faceValue: number,
  couponRate: number,
  maturity: number,
  yieldToMaturity: number,
  frequency: number = 2
): number {
  const n = maturity * frequency;
  const c = (faceValue * couponRate) / frequency;
  const y = yieldToMaturity / frequency;

  let weightedCashFlows = 0;
  let totalPV = 0;

  // Coupon payments
  for (let t = 1; t <= n; t++) {
    const pv = c / Math.pow(1 + y, t);
    const timeInYears = t / frequency;
    weightedCashFlows += timeInYears * pv;
    totalPV += pv;
  }

  // Principal payment
  const pvPrincipal = faceValue / Math.pow(1 + y, n);
  weightedCashFlows += maturity * pvPrincipal;
  totalPV += pvPrincipal;

  return weightedCashFlows / totalPV;
}

/**
 * Modified Duration
 *
 * Measures price sensitivity to yield changes
 * ModDuration = MacaulayDuration / (1 + y/f)
 *
 * dP/dy ≈ -ModDuration * P
 *
 * @returns Modified duration
 */
export function modifiedDuration(
  faceValue: number,
  couponRate: number,
  maturity: number,
  yieldToMaturity: number,
  frequency: number = 2
): number {
  const macDuration = macaulayDuration(faceValue, couponRate, maturity, yieldToMaturity, frequency);
  const y = yieldToMaturity / frequency;

  return macDuration / (1 + y);
}

/**
 * Dollar Duration
 *
 * Dollar change in price for 1% change in yield
 * DollarDuration = ModifiedDuration * Price
 *
 * @returns Dollar duration
 */
export function dollarDuration(
  faceValue: number,
  couponRate: number,
  maturity: number,
  yieldToMaturity: number,
  frequency: number = 2
): number {
  const price = bondPrice(faceValue, couponRate, maturity, yieldToMaturity, frequency);
  const modDur = modifiedDuration(faceValue, couponRate, maturity, yieldToMaturity, frequency);

  return modDur * price;
}

/**
 * Convexity
 *
 * Measures curvature of price-yield relationship
 * Second derivative of price with respect to yield
 *
 * Convexity = Σ (t * (t+1) * PV(CF_t)) / (P * (1+y)^2)
 *
 * @returns Convexity
 */
export function convexity(
  faceValue: number,
  couponRate: number,
  maturity: number,
  yieldToMaturity: number,
  frequency: number = 2
): number {
  const n = maturity * frequency;
  const c = (faceValue * couponRate) / frequency;
  const y = yieldToMaturity / frequency;
  const price = bondPrice(faceValue, couponRate, maturity, yieldToMaturity, frequency);

  let sumWeightedCF = 0;

  // Coupon payments
  for (let t = 1; t <= n; t++) {
    const pv = c / Math.pow(1 + y, t);
    const timeInYears = t / frequency;
    sumWeightedCF += timeInYears * (timeInYears + 1 / frequency) * pv;
  }

  // Principal payment
  const pvPrincipal = faceValue / Math.pow(1 + y, n);
  sumWeightedCF += maturity * (maturity + 1 / frequency) * pvPrincipal;

  return sumWeightedCF / (price * Math.pow(1 + y / frequency, 2));
}

/**
 * Price change estimate using duration and convexity
 *
 * ΔP/P ≈ -ModDur * Δy + 0.5 * Convexity * (Δy)^2
 *
 * @param price - Current price
 * @param modDuration - Modified duration
 * @param convexity - Convexity
 * @param yieldChange - Change in yield (e.g., 0.01 for 1%)
 * @returns Estimated price change
 */
export function priceChangeEstimate(
  price: number,
  modDuration: number,
  convexity: number,
  yieldChange: number
): number {
  const durationEffect = -modDuration * yieldChange;
  const convexityEffect = 0.5 * convexity * Math.pow(yieldChange, 2);

  return price * (durationEffect + convexityEffect);
}

/**
 * Current Yield
 *
 * Annual coupon payment / Current price
 * Simple yield measure (ignores time value)
 *
 * @returns Current yield
 */
export function currentYield(
  faceValue: number,
  couponRate: number,
  price: number
): number {
  const annualCoupon = faceValue * couponRate;
  return annualCoupon / price;
}

/**
 * Yield Curve Point
 */
export interface YieldCurvePoint {
  maturity: number; // Years
  yield: number; // Yield (decimal)
  rate: number; // Interest rate (same as yield for zero-coupon)
}

/**
 * Spot Rate (Zero-Coupon Rate)
 *
 * Interest rate for a zero-coupon bond
 * Used to build yield curve
 */
export function spotRate(
  maturity: number,
  yieldCurve: YieldCurvePoint[]
): number {
  // Linear interpolation if exact maturity not found
  if (yieldCurve.length === 0) return 0.05; // Default 5%

  // Find surrounding points
  let lower: YieldCurvePoint | null = null;
  let upper: YieldCurvePoint | null = null;

  for (const point of yieldCurve) {
    if (point.maturity === maturity) {
      return point.yield;
    }
    if (point.maturity < maturity) {
      lower = point;
    }
    if (point.maturity > maturity && upper === null) {
      upper = point;
    }
  }

  // Interpolate
  if (lower && upper) {
    const weight = (maturity - lower.maturity) / (upper.maturity - lower.maturity);
    return lower.yield + weight * (upper.yield - lower.yield);
  }

  // Extrapolate
  if (lower) return lower.yield;
  if (upper) return upper.yield;

  return 0.05;
}

/**
 * Forward Rate
 *
 * Implied future interest rate between two periods
 * (1 + r2)^t2 = (1 + r1)^t1 * (1 + f)^(t2-t1)
 *
 * @param r1 - Spot rate for period 1
 * @param t1 - Time period 1
 * @param r2 - Spot rate for period 2
 * @param t2 - Time period 2
 * @returns Forward rate
 */
export function forwardRate(
  r1: number,
  t1: number,
  r2: number,
  t2: number
): number {
  const numerator = Math.pow(1 + r2, t2);
  const denominator = Math.pow(1 + r1, t1);
  const exponent = 1 / (t2 - t1);

  return Math.pow(numerator / denominator, exponent) - 1;
}

/**
 * Bootstrapping Yield Curve
 *
 * Derive spot rates from bond prices
 *
 * @param bonds - Array of bond specs with prices
 * @returns Spot rate curve
 */
export interface BondMarketData {
  spec: BondSpec;
  price: number;
}

export function bootstrapYieldCurve(bonds: BondMarketData[]): YieldCurvePoint[] {
  // Sort by maturity
  const sortedBonds = [...bonds].sort((a, b) => a.spec.maturity - b.spec.maturity);

  const spotRates: YieldCurvePoint[] = [];

  for (const bond of sortedBonds) {
    // For zero-coupon bonds, spot rate = YTM
    if (bond.spec.couponRate === 0) {
      const ytm = yieldToMaturity(
        bond.price,
        bond.spec.faceValue,
        0,
        bond.spec.maturity,
        1
      );
      spotRates.push({
        maturity: bond.spec.maturity,
        yield: ytm,
        rate: ytm,
      });
    } else {
      // For coupon bonds, solve for spot rate using known shorter rates
      const ytm = yieldToMaturity(
        bond.price,
        bond.spec.faceValue,
        bond.spec.couponRate,
        bond.spec.maturity,
        bond.spec.frequency
      );
      spotRates.push({
        maturity: bond.spec.maturity,
        yield: ytm,
        rate: ytm,
      });
    }
  }

  return spotRates;
}

/**
 * Par Yield
 *
 * Coupon rate that makes bond price equal to par
 */
export function parYield(
  maturity: number,
  yieldCurve: YieldCurvePoint[],
  frequency: number = 2
): number {
  const spot = spotRate(maturity, yieldCurve);
  const n = maturity * frequency;
  const y = spot / frequency;

  // Par yield formula
  const numerator = 1 - Math.pow(1 + y, -n);
  const denominator = (1 / y) * numerator;

  return (1 - Math.pow(1 + y, -n)) / denominator;
}

/**
 * Bond Immunization
 *
 * Strategy to protect portfolio from interest rate risk
 * Match duration of assets and liabilities
 */
export interface ImmunizationStrategy {
  targetDuration: number;
  bonds: {
    spec: BondSpec;
    weight: number;
    duration: number;
  }[];
  portfolioDuration: number;
  durationMatch: boolean;
}

/**
 * Create immunized portfolio
 *
 * @param targetDuration - Target duration to match
 * @param availableBonds - Available bonds to choose from
 * @returns Immunization strategy
 */
export function immunizePortfolio(
  targetDuration: number,
  availableBonds: BondSpec[]
): ImmunizationStrategy | null {
  // Simple two-bond immunization
  // Find short and long bonds
  const bondsWithDuration = availableBonds.map((spec) => ({
    spec,
    duration: macaulayDuration(
      spec.faceValue,
      spec.couponRate,
      spec.maturity,
      spec.yieldToMaturity || 0.05,
      spec.frequency
    ),
  }));

  // Sort by duration
  bondsWithDuration.sort((a, b) => a.duration - b.duration);

  // Take shortest and longest
  const shortBond = bondsWithDuration[0];
  const longBond = bondsWithDuration[bondsWithDuration.length - 1];

  if (!shortBond || !longBond || shortBond.duration === longBond.duration) {
    return null;
  }

  // Calculate weights
  // w1 * D1 + w2 * D2 = Dtarget
  // w1 + w2 = 1
  const w2 = (targetDuration - shortBond.duration) / (longBond.duration - shortBond.duration);
  const w1 = 1 - w2;

  if (w1 < 0 || w2 < 0 || w1 > 1 || w2 > 1) {
    return null; // Target duration outside range
  }

  const portfolioDuration = w1 * shortBond.duration + w2 * longBond.duration;

  return {
    targetDuration,
    bonds: [
      { spec: shortBond.spec, weight: w1, duration: shortBond.duration },
      { spec: longBond.spec, weight: w2, duration: longBond.duration },
    ],
    portfolioDuration,
    durationMatch: Math.abs(portfolioDuration - targetDuration) < 0.01,
  };
}

/**
 * Credit Spread
 *
 * Difference between corporate bond yield and risk-free rate
 * Compensates for default risk
 *
 * @param corporateYield - Yield on corporate bond
 * @param treasuryYield - Yield on Treasury (risk-free)
 * @returns Credit spread (basis points)
 */
export function creditSpread(corporateYield: number, treasuryYield: number): number {
  return (corporateYield - treasuryYield) * 10000; // Convert to basis points
}

/**
 * Z-Spread
 *
 * Constant spread over Treasury curve
 * Makes bond NPV equal to its price
 */
export function zSpread(
  price: number,
  faceValue: number,
  couponRate: number,
  maturity: number,
  treasuryYieldCurve: YieldCurvePoint[],
  frequency: number = 2
): number {
  // Iterative search for z-spread
  let zSpread = 0;
  const tolerance = 0.0001;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    const n = maturity * frequency;
    const c = (faceValue * couponRate) / frequency;

    for (let t = 1; t <= n; t++) {
      const timeInYears = t / frequency;
      const spotYield = spotRate(timeInYears, treasuryYieldCurve);
      const discountRate = (spotYield + zSpread) / frequency;
      npv += c / Math.pow(1 + discountRate, t);
    }

    // Add principal
    const spotYieldMaturity = spotRate(maturity, treasuryYieldCurve);
    const discountRate = (spotYieldMaturity + zSpread) / frequency;
    npv += faceValue / Math.pow(1 + discountRate, n);

    const diff = npv - price;

    if (Math.abs(diff) < tolerance) {
      return zSpread;
    }

    // Adjust z-spread
    zSpread -= diff * 0.0001;
  }

  return zSpread;
}

/**
 * Accrued Interest
 *
 * Interest accumulated since last coupon payment
 * Important for bond pricing between coupon dates
 *
 * @param faceValue - Par value
 * @param couponRate - Annual coupon rate
 * @param frequency - Payments per year
 * @param daysSinceLastCoupon - Days since last payment
 * @param daysInPeriod - Days in coupon period
 * @returns Accrued interest
 */
export function accruedInterest(
  faceValue: number,
  couponRate: number,
  frequency: number,
  daysSinceLastCoupon: number,
  daysInPeriod: number
): number {
  const couponPayment = (faceValue * couponRate) / frequency;
  return couponPayment * (daysSinceLastCoupon / daysInPeriod);
}

/**
 * Generate sample yield curve (Nelson-Siegel model)
 *
 * Popular parametric yield curve model
 */
export function nelsonSiegelYieldCurve(
  maturities: number[],
  beta0: number = 0.06,
  beta1: number = -0.02,
  beta2: number = 0.01,
  tau: number = 2
): YieldCurvePoint[] {
  return maturities.map((m) => {
    if (m === 0) return { maturity: 0, yield: beta0, rate: beta0 };

    const factor1 = (1 - Math.exp(-m / tau)) / (m / tau);
    const factor2 = factor1 - Math.exp(-m / tau);

    const yieldValue = beta0 + beta1 * factor1 + beta2 * factor2;

    return {
      maturity: m,
      yield: Math.max(0, yieldValue),
      rate: Math.max(0, yieldValue),
    };
  });
}
