/**
 * Public API Exports
 * 
 * Import from this file in your production code:
 * import { DashboardPage, type Goal } from '@/app/exports'
 */

// ============================================
// APP CONFIGURATION
// ============================================
export { default as appConfig, IS_PREVIEW, APP_MODE, API_CONFIG, FEATURES } from './app.config';

// ============================================
// PRODUCTION LOGIC (Only use in production mode)
// ============================================
export * as finance from './logic/finance';
export * as supabase from './logic/supabase';
export * as auth from './logic/auth';
export * as networth from './logic/networth';
export * as helpers from './logic/helpers';

// ============================================
// COMPONENTS
// ============================================

export { GoalCard } from './components/GoalCard';
export { AccountCard } from './components/AccountCard';
export { DebtCard } from './components/DebtCard';
export { IncomeCard } from './components/IncomeCard';
export { FixedCostCard } from './components/FixedCostCard';

// ============================================
// PAGES
// ============================================

export { DashboardPage } from './pages/DashboardPage';
export { GoalsPage } from './pages/GoalsPage';
export { PersonalFinancePage } from './pages/PersonalFinancePage';

// ============================================
// TYPES
// ============================================

export type {
  Goal,
  GoalCategory,
  Account,
  Debt,
  Income,
  FixedCost,
  Transaction,
  User,
  Household,
  AppSettings,
  MockDatabase,
  MockAuthState,
} from './preview/types';

// ============================================
// PREVIEW SYSTEM (for testing/development)
// ============================================

export { getMockDatabase, resetMockDatabase, mockAPI } from './preview/mockDatabase';
export { createMockAuth, getCurrentUser, setMockUser } from './preview/mockAuth';
export { getMockSettings, updateMockSettings } from './preview/mockSettings';

// ============================================
// MOCK DATA (for testing/storybook)
// ============================================

export { mockGoals } from './preview/mockGoals';
export { mockAccounts } from './preview/mockAccounts';
export { mockDebts } from './preview/mockDebts';
export { mockIncomes, mockFixedCosts, mockTransactions } from './preview/mockTransactions';
export { mockUser, mockHousehold } from './preview/mockUser';

// ============================================
// PREVIEW COMPONENT (for iframe preview mode)
// ============================================

export { default as AppPreview } from './preview/AppPreview';