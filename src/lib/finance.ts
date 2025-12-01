
/**
 * Core Financial Constants & Types
 */

export const EMERGENCY_FUND_TARGET = 10_000;      // €10k safety fund
export const HOUSE_TARGET = 500_000;             // Dream house target
export const CASH_RATIO_FOR_HOUSE = 0.30;        // 20% dp + ~10% taxes/gastos
export const DTI_LIMIT = 0.35;                   // 35% of net income (max debt load)

// Default scenario
export const DEFAULT_LOAN_YEARS = 30;
export const DEFAULT_INTEREST = 0.028;   // 2.8% fixed ~ 2024/2025 average for good profiles

// Market Data Default (Used for init, replaced by API)
export const STATIC_MARKET_DATA = {
  euribor12m: 2.60,
  avgFixedRate: 2.75,
  avgVariableSpread: 0.60,
  transferTax: 0.10, // 10% ITP
  notaryFees: 2000,  // Approx
};

export type Inputs = {
  incomeRicardo: number;
  incomeMaria: number;
  fixedCosts: number;
  otherDebtPayments: number;
  savingsTotal: number;
  avgMonthlySavings: number;
};

export type MortgageConfig = {
  emergencyFund: number;
  houseTarget: number;
  cashRatio: number;
  dtiLimit: number;
  annualRate: number;
  years: number;
  savingsReturnRate?: number; // Annual return on savings (0.05 = 5%)
};

export type FeasibilityResult = {
  householdNetIncome: number;
  availableForHouse: number;
  maxAffordableHouse: number;
  requiredCashTarget: number;
  missingCashTarget: number;
  dtiForTarget: number;
  hasEnoughCashForTarget: boolean;
  dtiOkForTarget: boolean;
  fullyReadyForTarget: boolean;
  monthsToTarget: number;
  monthlyForTarget: number;
  limitingFactor: 'cash' | 'dti' | 'none';
};

/**
 * Formatting Utilities
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Market Sentiment Analysis
 */
export const getMarketSentiment = (euribor: number = STATIC_MARKET_DATA.euribor12m) => {
  if (euribor > 3.5) return "Seller's Market (High Rates)";
  if (euribor < 2.0) return "Buyer's Market (Low Rates)";
  return "Neutral Market (Stable Rates)";
};

export const getMortgageAdvice = (euribor: number = STATIC_MARKET_DATA.euribor12m) => {
  if (euribor > 3.0) return "Rates are high. Consider a shorter term or larger down payment to minimize interest.";
  if (euribor < 2.0) return "Great time to lock in a fixed rate mortgage.";
  return "Rates are moderate. A fixed rate under 3% is a solid choice right now.";
};

/**
 * 4.1 Monthly payment formula
 */
export function mortgageMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return n > 0 ? principal / n : 0;

  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * 4.3 Invert formula → maximum mortgage amount you can borrow
 */
export function maxMortgagePrincipalFromPayment(maxPayment: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return maxPayment * n;

  return maxPayment * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

/**
 * Risk Calculation
 * Returns number of months delayed
 */
export function calculateGoalDelay(
    expenseAmount: number, 
    monthlySavings: number,
    missingCashForMainGoal: number
): number {
    if (monthlySavings <= 0) return Infinity;
    if (missingCashForMainGoal <= 0) return 0; // Already reached goal, but this eats into it? 
    // Simple logic: Spending X means X less in savings. It takes X/SavingsRate months to recover X.
    return Math.ceil(expenseAmount / monthlySavings);
}

/**
 * Main Feasibility Calculation Engine
 */
export function computeFeasibility(inputs: Inputs, cfg: MortgageConfig): FeasibilityResult {
  const {
    incomeRicardo,
    incomeMaria,
    fixedCosts, 
    otherDebtPayments,
    savingsTotal,
    avgMonthlySavings
  } = inputs;

  const {
    emergencyFund,
    houseTarget,
    cashRatio,
    dtiLimit,
    annualRate,
    years,
    savingsReturnRate = 0 // Default 0%
  } = cfg;

  const householdNetIncome = incomeRicardo + incomeMaria;
  
  // 3. Cash actually available for a house
  const availableForHouse = Math.max(savingsTotal - emergencyFund, 0);

  // Target House Calcs
  const requiredCashTarget = houseTarget * cashRatio;
  const missingCashTarget = Math.max(requiredCashTarget - availableForHouse, 0);

  // 4.2 Maximum mortgage payment allowed by DTI
  const maxTotalDebtPayment = householdNetIncome * dtiLimit;
  const maxMortgagePayment = Math.max(0, maxTotalDebtPayment - otherDebtPayments);

  // 4.3 Max Mortgage Principal
  const maxMortgagePrincipal = maxMortgagePayment > 0
    ? maxMortgagePrincipalFromPayment(maxMortgagePayment, annualRate, years)
    : 0;

  const loanRatio = 1 - cashRatio;

  // 5. Maximum house price today
  // 5.1 Max by Cash
  const maxHouseByCash = cashRatio > 0 ? availableForHouse / cashRatio : 0;
  
  // 5.2 Max by DTI
  const maxHouseByDTI = loanRatio > 0 ? maxMortgagePrincipal / loanRatio : 0;
  
  // 5.3 Real Maximum
  const maxAffordableHouse = Math.max(0, Math.min(maxHouseByCash, maxHouseByDTI));

  // Determine Limiting Factor
  let limitingFactor: 'cash' | 'dti' | 'none' = 'none';
  if (maxAffordableHouse < houseTarget) {
      limitingFactor = maxHouseByCash < maxHouseByDTI ? 'cash' : 'dti';
  }

  // 6. Readiness for Specific Target
  const loanForTarget = houseTarget * loanRatio;
  const monthlyForTarget = mortgageMonthlyPayment(loanForTarget, annualRate, years);
  const dtiForTarget = householdNetIncome > 0 ? (monthlyForTarget + otherDebtPayments) / householdNetIncome : Infinity;

  const hasEnoughCashForTarget = availableForHouse >= requiredCashTarget;
  const dtiOkForTarget = dtiForTarget <= dtiLimit;
  const fullyReadyForTarget = hasEnoughCashForTarget && dtiOkForTarget;

  // 7. Time to Goal (with compound interest)
  let monthsToTarget = Infinity;
  
  if (missingCashTarget <= 0) {
      monthsToTarget = 0;
  } else if (avgMonthlySavings > 0) {
      if (savingsReturnRate > 0) {
          // Compound Interest Formula for NPER
          // n = ln( (FV + PMT/r) / (PV + PMT/r) ) / ln(1+r)
          // Here, Target = FV. PV = availableForHouse.
          const r = savingsReturnRate / 12; // Monthly rate
          const FV = requiredCashTarget;
          const PV = availableForHouse;
          const PMT = avgMonthlySavings;
          
          try {
              const numerator = (FV + PMT/r);
              const denominator = (PV + PMT/r);
              monthsToTarget = Math.ceil( Math.log(numerator / denominator) / Math.log(1 + r) );
          } catch (e) {
              monthsToTarget = Infinity; // Fallback
          }
      } else {
          // Linear
          monthsToTarget = Math.ceil(missingCashTarget / avgMonthlySavings);
      }
  }

  return {
    householdNetIncome,
    availableForHouse,
    maxAffordableHouse,
    requiredCashTarget,
    missingCashTarget,
    dtiForTarget,
    hasEnoughCashForTarget,
    dtiOkForTarget,
    fullyReadyForTarget,
    monthsToTarget,
    monthlyForTarget,
    limitingFactor
  };
}
