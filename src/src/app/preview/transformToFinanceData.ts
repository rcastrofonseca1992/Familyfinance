/**
 * Transform Preview Mock Data to FinanceContext Data Structure
 * 
 * This utility converts the comprehensive preview mock data from /src/app/preview
 * into the FinanceData structure used by FinanceContext
 */

import { getMockDatabase } from './mockDatabase';
import type { FinanceData, Account, RecurringCost, Goal, Debt as FinanceDebt, IncomeSource } from '../../../components/store/FinanceContext';

/**
 * Map preview goal categories to FinanceContext categories
 */
const mapGoalCategory = (previewCategory: string): 'home' | 'trip' | 'kids' | 'emergency' | 'other' | 'mortgage' | 'car' | 'general' => {
  const categoryMap: Record<string, 'home' | 'trip' | 'kids' | 'emergency' | 'other' | 'mortgage' | 'car' | 'general'> = {
    'mortgage': 'mortgage',
    'emergency': 'emergency',
    'travel': 'trip',
    'car': 'car',
    'kids': 'kids',
    'general': 'general',
  };
  return categoryMap[previewCategory] || 'other';
};

/**
 * Map preview account types to FinanceContext types
 */
const mapAccountType = (previewType: string): 'savings' | 'investment' | 'cash' | 'debt' => {
  const typeMap: Record<string, 'savings' | 'investment' | 'cash' | 'debt'> = {
    'checking': 'cash',
    'savings': 'savings',
    'investment': 'investment',
  };
  return typeMap[previewType] || 'cash';
};

/**
 * Convert preview frequency to monthly amount
 */
const convertToMonthlyAmount = (amount: number, frequency: string): number => {
  const frequencyMap: Record<string, number> = {
    'monthly': 1,
    'annual': 1 / 12,
    'biweekly': 26 / 12,
    'weekly': 52 / 12,
  };
  return amount * (frequencyMap[frequency] || 1);
};

/**
 * Transform preview mock database to FinanceData
 */
export function transformPreviewDataToFinanceData(): FinanceData {
  const mockDb = getMockDatabase();
  const demoUserId = 'preview-user-1';

  // Transform Income Sources
  const incomeSources: IncomeSource[] = mockDb.incomes.map(income => ({
    id: income.id,
    name: income.source,
    amount: convertToMonthlyAmount(income.amount, income.frequency),
    ownerId: demoUserId,
  }));

  // Calculate total net income
  const totalNetIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);

  // Transform User
  const user = mockDb.user ? {
    id: demoUserId,
    name: mockDb.user.name,
    email: mockDb.user.email,
    role: 'owner' as const,
    netIncome: totalNetIncome,
    incomeSources,
  } : null;

  // Transform Household
  const household = mockDb.household ? {
    id: mockDb.household.id,
    name: mockDb.household.name,
    joinCode: mockDb.household.inviteCode,
    members: user ? [user] : [],
    monthlySnapshots: [],
  } : null;

  // Transform Accounts
  const accounts: Account[] = mockDb.accounts.map(acc => ({
    id: acc.id,
    name: acc.name,
    type: mapAccountType(acc.type),
    balance: acc.balance,
    institution: acc.institution || '',
    currency: 'EUR',
    ownerId: demoUserId,
    includeInHousehold: true,
    apy: acc.type === 'investment' ? 7.0 : acc.type === 'savings' ? 2.5 : undefined,
  }));

  // Transform Recurring Costs (Fixed Costs)
  const recurringCosts: RecurringCost[] = mockDb.fixedCosts.map(cost => ({
    id: cost.id,
    name: cost.name,
    amount: convertToMonthlyAmount(cost.amount, cost.frequency),
    category: cost.category || 'other',
    frequency: cost.frequency === 'annual' ? 'yearly' : 'monthly',
    ownerId: demoUserId,
    includeInHousehold: true,
  }));

  // Transform Goals
  const goals: Goal[] = mockDb.goals.map(goal => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: goal.deadline,
    category: mapGoalCategory(goal.category),
    isMain: goal.category === 'mortgage',
    propertyValue: goal.propertyValue,
  }));

  // Transform Debts
  const debts: FinanceDebt[] = mockDb.debts.map(debt => ({
    id: debt.id,
    name: debt.name,
    totalAmount: debt.balance, // Use balance as total for simplicity
    remainingAmount: debt.balance,
    monthlyPayment: debt.minimumPayment,
    interestRate: debt.interestRate,
    ownerId: demoUserId,
  }));

  return {
    user,
    household,
    accounts,
    recurringCosts,
    goals,
    debts,
    emergencyFundGoal: 15000,
    isVariableIncome: false,
    currency: 'EUR',
    theme: 'light',
    variableSpending: 0,
    marketData: {
      euribor12m: 3.2,
      euribor6m: 3.1,
      euribor3m: 3.0,
      source: 'SIMULATED',
      lastUpdated: new Date().toISOString(),
    },
    monthlySnapshots: [],
  };
}