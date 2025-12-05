/**
 * Net Worth Logic
 * 
 * Net worth calculations, asset/liability tracking, trend analysis
 * 
 * ⚠️ PRODUCTION ONLY - NOT executed in Figma Make preview mode
 */

import { Account, Debt } from '../preview/types';

/**
 * Calculate total assets from accounts
 */
export function calculateTotalAssets(accounts: Account[]): number {
  return accounts.reduce((total, account) => total + account.balance, 0);
}

/**
 * Calculate total liabilities from debts
 */
export function calculateTotalLiabilities(debts: Debt[]): number {
  return debts.reduce((total, debt) => total + debt.currentBalance, 0);
}

/**
 * Calculate net worth
 */
export function calculateNetWorth(accounts: Account[], debts: Debt[]): number {
  const assets = calculateTotalAssets(accounts);
  const liabilities = calculateTotalLiabilities(debts);
  return assets - liabilities;
}

/**
 * Calculate net worth by category
 */
export function calculateNetWorthByCategory(accounts: Account[], debts: Debt[]) {
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type || 'other';
    acc[type] = (acc[type] || 0) + account.balance;
    return acc;
  }, {} as Record<string, number>);
  
  const debtsByType = debts.reduce((acc, debt) => {
    const type = debt.type || 'other';
    acc[type] = (acc[type] || 0) + debt.currentBalance;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    assets: accountsByType,
    liabilities: debtsByType,
  };
}

/**
 * Calculate liquid net worth (easily accessible assets)
 */
export function calculateLiquidNetWorth(accounts: Account[], debts: Debt[]): number {
  const liquidAccountTypes = ['checking', 'savings', 'emergency'];
  
  const liquidAssets = accounts
    .filter(account => liquidAccountTypes.includes(account.type))
    .reduce((total, account) => total + account.balance, 0);
  
  const liabilities = calculateTotalLiabilities(debts);
  
  return liquidAssets - liabilities;
}

/**
 * Calculate debt-to-asset ratio
 */
export function calculateDebtToAssetRatio(accounts: Account[], debts: Debt[]): number {
  const assets = calculateTotalAssets(accounts);
  const liabilities = calculateTotalLiabilities(debts);
  
  if (assets === 0) return liabilities > 0 ? Infinity : 0;
  return (liabilities / assets) * 100;
}

/**
 * Classify financial health based on net worth and ratios
 */
export function classifyFinancialHealth(
  netWorth: number,
  debtToAssetRatio: number,
  liquidNetWorth: number
): {
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  label: string;
  color: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  // Net worth check
  const netWorthScore = netWorth > 0 ? 2 : netWorth > -50000 ? 1 : 0;
  
  // Debt to asset ratio check
  const debtRatioScore = debtToAssetRatio < 20 ? 2 : debtToAssetRatio < 40 ? 1 : 0;
  
  // Liquid net worth check
  const liquidScore = liquidNetWorth > 10000 ? 2 : liquidNetWorth > 0 ? 1 : 0;
  
  const totalScore = netWorthScore + debtRatioScore + liquidScore;
  
  // Generate recommendations
  if (netWorth <= 0) {
    recommendations.push('Foque em aumentar seus ativos ou reduzir dívidas');
  }
  
  if (debtToAssetRatio > 40) {
    recommendations.push('Considere um plano de redução de dívidas');
  }
  
  if (liquidNetWorth < 10000) {
    recommendations.push('Construa um fundo de emergência maior');
  }
  
  // Classify based on total score
  if (totalScore >= 5) {
    return {
      level: 'excellent',
      label: 'Excelente',
      color: 'green',
      recommendations: ['Continue com sua estratégia financeira atual'],
    };
  }
  
  if (totalScore >= 4) {
    return {
      level: 'good',
      label: 'Bom',
      color: 'blue',
      recommendations: recommendations.length > 0 ? recommendations : ['Mantenha o bom trabalho'],
    };
  }
  
  if (totalScore >= 2) {
    return {
      level: 'fair',
      label: 'Aceitável',
      color: 'yellow',
      recommendations,
    };
  }
  
  if (totalScore >= 1) {
    return {
      level: 'poor',
      label: 'Atenção Necessária',
      color: 'orange',
      recommendations,
    };
  }
  
  return {
    level: 'critical',
    label: 'Crítico',
    color: 'red',
    recommendations: [
      'Procure aconselhamento financeiro profissional',
      'Crie um plano de recuperação financeira urgente',
      ...recommendations,
    ],
  };
}

/**
 * Project net worth growth over time
 */
export function projectNetWorthGrowth(
  currentNetWorth: number,
  monthlySavings: number,
  annualReturnRate: number,
  months: number
): number[] {
  const monthlyRate = annualReturnRate / 12 / 100;
  const projections: number[] = [currentNetWorth];
  
  let currentValue = currentNetWorth;
  
  for (let i = 1; i <= months; i++) {
    // Add monthly savings and apply growth
    currentValue = (currentValue + monthlySavings) * (1 + monthlyRate);
    projections.push(currentValue);
  }
  
  return projections;
}

/**
 * Calculate months until net worth target
 */
export function calculateMonthsToNetWorthTarget(
  currentNetWorth: number,
  targetNetWorth: number,
  monthlySavings: number,
  annualReturnRate: number
): number {
  if (currentNetWorth >= targetNetWorth) return 0;
  if (monthlySavings <= 0) return Infinity;
  
  const monthlyRate = annualReturnRate / 12 / 100;
  
  // Iterative approach since it's a complex formula
  let months = 0;
  let currentValue = currentNetWorth;
  const maxIterations = 1200; // 100 years max
  
  while (currentValue < targetNetWorth && months < maxIterations) {
    currentValue = (currentValue + monthlySavings) * (1 + monthlyRate);
    months++;
  }
  
  return months === maxIterations ? Infinity : months;
}

/**
 * Format net worth for display
 */
export function formatNetWorth(
  netWorth: number,
  locale: string = 'pt-PT',
  currency: string = 'EUR'
): string {
  const prefix = netWorth < 0 ? '-' : '';
  const absoluteValue = Math.abs(netWorth);
  
  return prefix + new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(absoluteValue);
}
