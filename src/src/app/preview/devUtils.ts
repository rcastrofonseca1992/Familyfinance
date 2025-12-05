/**
 * Development Utilities
 * Helper functions for testing and debugging the preview environment
 */

import { getMockDatabase, resetMockDatabase, updateMockDatabase, mockAPI } from './mockDatabase';
import { getCurrentUser, setMockUser } from './mockAuth';
import { getMockSettings, updateMockSettings } from './mockSettings';

/**
 * Log current database state to console
 */
export const logDatabaseState = () => {
  const db = getMockDatabase();
  console.group('📊 Mock Database State');
  console.log('User:', db.user);
  console.log('Household:', db.household);
  console.log('Goals:', db.goals.length);
  console.log('Accounts:', db.accounts.length);
  console.log('Debts:', db.debts.length);
  console.log('Incomes:', db.incomes.length);
  console.log('Fixed Costs:', db.fixedCosts.length);
  console.log('Transactions:', db.transactions.length);
  console.log('Settings:', db.settings);
  console.groupEnd();
};

/**
 * Simulate logged out state
 */
export const simulateLogout = () => {
  console.log('👤 Simulating logout...');
  setMockUser(null);
};

/**
 * Simulate logged in state
 */
export const simulateLogin = () => {
  console.log('👤 Simulating login...');
  const db = getMockDatabase();
  setMockUser(db.user);
};

/**
 * Add random test goal
 */
export const addTestGoal = async () => {
  const randomGoal = {
    name: `Test Goal ${Date.now()}`,
    category: 'general' as const,
    targetAmount: Math.floor(Math.random() * 50000) + 10000,
    currentAmount: Math.floor(Math.random() * 5000),
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    requiredMonthlyContribution: 500,
    expectedAPY: 3.5,
    tags: ['Test'],
  };
  
  const newGoal = await mockAPI.createGoal(randomGoal);
  console.log('✅ Added test goal:', newGoal);
  return newGoal;
};

/**
 * Add random test account
 */
export const addTestAccount = async () => {
  const randomAccount = {
    name: `Test Account ${Date.now()}`,
    type: 'checking' as const,
    balance: Math.floor(Math.random() * 10000) + 1000,
    institution: 'Test Bank',
    color: '#3b82f6',
  };
  
  const newAccount = await mockAPI.createAccount(randomAccount);
  console.log('✅ Added test account:', newAccount);
  return newAccount;
};

/**
 * Clear all goals
 */
export const clearAllGoals = () => {
  const db = getMockDatabase();
  updateMockDatabase({ goals: [] });
  console.log('🗑️ Cleared all goals');
};

/**
 * Reset database to initial state
 */
export const resetDatabase = () => {
  resetMockDatabase();
  console.log('🔄 Database reset to initial state');
  logDatabaseState();
};

/**
 * Toggle theme
 */
export const toggleTheme = () => {
  const settings = getMockSettings();
  const newTheme = settings.theme === 'light' ? 'dark' : 'light';
  updateMockSettings({ theme: newTheme });
  console.log(`🎨 Theme changed to: ${newTheme}`);
};

/**
 * Toggle language
 */
export const toggleLanguage = () => {
  const settings = getMockSettings();
  const newLanguage = settings.language === 'en' ? 'pt' : 'en';
  updateMockSettings({ language: newLanguage });
  console.log(`🌍 Language changed to: ${newLanguage}`);
};

/**
 * Get financial summary
 */
export const getFinancialSummary = () => {
  const db = getMockDatabase();
  
  const totalAssets = db.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalDebts = db.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const netWorth = totalAssets - totalDebts;
  
  const totalGoalsTarget = db.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalsSaved = db.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const goalsProgress = (totalGoalsSaved / totalGoalsTarget) * 100;
  
  const totalIncome = db.incomes.reduce((sum, inc) => {
    const multiplier = inc.frequency === 'annual' ? 1/12 : 
                      inc.frequency === 'weekly' ? 4.33 :
                      inc.frequency === 'biweekly' ? 2 : 1;
    return sum + (inc.amount * multiplier);
  }, 0);
  
  const totalFixedCosts = db.fixedCosts.reduce((sum, cost) => {
    const multiplier = cost.frequency === 'annual' ? 1/12 : 1;
    return sum + (cost.amount * multiplier);
  }, 0);
  
  const monthlyDebtPayments = db.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  const summary = {
    netWorth,
    totalAssets,
    totalDebts,
    goalsProgress,
    totalGoalsTarget,
    totalGoalsSaved,
    monthlyIncome: totalIncome,
    monthlyExpenses: totalFixedCosts + monthlyDebtPayments,
    monthlyFlow: totalIncome - totalFixedCosts - monthlyDebtPayments,
  };
  
  console.group('💰 Financial Summary');
  console.log('Net Worth:', formatCurrency(summary.netWorth));
  console.log('Total Assets:', formatCurrency(summary.totalAssets));
  console.log('Total Debts:', formatCurrency(summary.totalDebts));
  console.log('Goals Progress:', `${summary.goalsProgress.toFixed(1)}%`);
  console.log('Monthly Income:', formatCurrency(summary.monthlyIncome));
  console.log('Monthly Expenses:', formatCurrency(summary.monthlyExpenses));
  console.log('Monthly Flow:', formatCurrency(summary.monthlyFlow));
  console.groupEnd();
  
  return summary;
};

/**
 * Format currency helper
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Export all dev tools to window for console access
 */
if (typeof window !== 'undefined') {
  (window as any).devUtils = {
    logDatabaseState,
    simulateLogout,
    simulateLogin,
    addTestGoal,
    addTestAccount,
    clearAllGoals,
    resetDatabase,
    toggleTheme,
    toggleLanguage,
    getFinancialSummary,
  };
  
  console.log('🛠️ Dev utils available via window.devUtils');
  console.log('   Try: devUtils.logDatabaseState()');
}

export default {
  logDatabaseState,
  simulateLogout,
  simulateLogin,
  addTestGoal,
  addTestAccount,
  clearAllGoals,
  resetDatabase,
  toggleTheme,
  toggleLanguage,
  getFinancialSummary,
};
