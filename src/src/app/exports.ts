/**
 * Figma Make - Public Exports
 * 
 * Import components, pages, and types from this file
 * for easy integration with your production app.
 * 
 * Example:
 *   import { GoalCard, DashboardPage, type Goal } from './app/exports';
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { GoalCard } from './components/GoalCard';
export { AccountCard } from './components/AccountCard';
export { DebtCard } from './components/DebtCard';
export { IncomeCard } from './components/IncomeCard';
export { FixedCostCard } from './components/FixedCostCard';

// ============================================================================
// PAGES
// ============================================================================

export { DashboardPage } from './pages/DashboardPage';
export { GoalsPage } from './pages/GoalsPage';
export { PersonalFinancePage } from './pages/PersonalFinancePage';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// PREVIEW SYSTEM (for testing/development)
// ============================================================================

export { getMockDatabase, resetMockDatabase, mockAPI } from './preview/mockDatabase';
export { createMockAuth, getCurrentUser, setMockUser } from './preview/mockAuth';
export { getMockSettings, updateMockSettings } from './preview/mockSettings';

// ============================================================================
// MOCK DATA (for testing/storybook)
// ============================================================================

export { mockGoals } from './preview/mockGoals';
export { mockAccounts } from './preview/mockAccounts';
export { mockDebts } from './preview/mockDebts';
export { mockIncomes, mockFixedCosts, mockTransactions } from './preview/mockTransactions';
export { mockUser, mockHousehold } from './preview/mockUser';

// ============================================================================
// PREVIEW COMPONENT (for iframe preview mode)
// ============================================================================

export { default as AppPreview } from './preview/AppPreview';
