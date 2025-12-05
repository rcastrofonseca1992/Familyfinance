/**
 * Finance Logic
 * 
 * Financial calculations, compound interest, projections, feasibility
 * 
 * ⚠️ PRODUCTION ONLY - NOT executed in Figma Make preview mode
 */

/**
 * Calculate compound interest
 */
export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  
  // Future value of principal
  const fvPrincipal = principal * Math.pow(1 + monthlyRate, months);
  
  // Future value of monthly contributions (annuity)
  const fvContributions = monthlyContribution * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return fvPrincipal + fvContributions;
}

/**
 * Calculate required monthly contribution to reach goal
 */
export function calculateRequiredMonthlyContribution(
  currentAmount: number,
  targetAmount: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return targetAmount - currentAmount;
  
  const monthlyRate = annualRate / 12 / 100;
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, months);
  const remainingNeeded = targetAmount - futureValueOfCurrent;
  
  if (remainingNeeded <= 0) return 0;
  
  // PMT formula: remaining / ((1 + r)^n - 1) / r)
  const monthlyContribution = remainingNeeded / 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return Math.max(0, monthlyContribution);
}

/**
 * Calculate months until goal completion
 */
export function calculateMonthsToGoal(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  annualRate: number
): number {
  if (currentAmount >= targetAmount) return 0;
  if (monthlyContribution <= 0) return Infinity;
  
  const monthlyRate = annualRate / 12 / 100;
  
  // Solve for n in FV formula
  // This is an approximation using logarithms
  const numerator = Math.log(
    (targetAmount * monthlyRate + monthlyContribution) /
    (currentAmount * monthlyRate + monthlyContribution)
  );
  const denominator = Math.log(1 + monthlyRate);
  
  return Math.ceil(numerator / denominator);
}

/**
 * Calculate goal progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

/**
 * Calculate feasibility score (0-100)
 */
export function calculateFeasibilityScore(
  requiredMonthly: number,
  availableMonthly: number
): number {
  if (requiredMonthly <= 0) return 100;
  if (availableMonthly <= 0) return 0;
  
  const ratio = availableMonthly / requiredMonthly;
  
  if (ratio >= 1.5) return 100; // Muito viável
  if (ratio >= 1.0) return 80;  // Viável
  if (ratio >= 0.7) return 60;  // Desafiante
  if (ratio >= 0.5) return 40;  // Difícil
  return 20; // Muito difícil
}

/**
 * Calculate available monthly amount for goals
 */
export function calculateAvailableMonthly(
  totalIncome: number,
  fixedCosts: number,
  debtPayments: number,
  safetyMargin: number = 0.2 // 20% safety margin
): number {
  const available = totalIncome - fixedCosts - debtPayments;
  return Math.max(0, available * (1 - safetyMargin));
}

/**
 * Calculate net worth
 */
export function calculateNetWorth(
  accountsTotal: number,
  debtsTotal: number
): number {
  return accountsTotal - debtsTotal;
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(
  monthlySavings: number,
  monthlyIncome: number
): number {
  if (monthlyIncome <= 0) return 0;
  return (monthlySavings / monthlyIncome) * 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  locale: string = 'pt-PT',
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDebtToIncomeRatio(
  totalDebtPayments: number,
  grossIncome: number
): number {
  if (grossIncome <= 0) return 0;
  return (totalDebtPayments / grossIncome) * 100;
}

/**
 * Classify debt-to-income ratio
 */
export function classifyDebtToIncomeRatio(ratio: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  label: string;
  color: string;
} {
  if (ratio <= 20) {
    return { level: 'excellent', label: 'Excelente', color: 'green' };
  }
  if (ratio <= 36) {
    return { level: 'good', label: 'Bom', color: 'blue' };
  }
  if (ratio <= 43) {
    return { level: 'fair', label: 'Aceitável', color: 'yellow' };
  }
  if (ratio <= 50) {
    return { level: 'poor', label: 'Alto', color: 'orange' };
  }
  return { level: 'critical', label: 'Crítico', color: 'red' };
}
