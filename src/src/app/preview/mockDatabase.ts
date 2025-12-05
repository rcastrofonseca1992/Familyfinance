import { MockDatabase, AppSettings } from './types';
import { mockUser, mockHousehold } from './mockUser';
import { mockGoals } from './mockGoals';
import { mockAccounts } from './mockAccounts';
import { mockDebts } from './mockDebts';
import { mockIncomes, mockFixedCosts, mockTransactions } from './mockTransactions';

/**
 * Complete mock database for preview environment
 * This simulates the entire Supabase database in memory
 */

const mockSettings: AppSettings = {
  theme: 'system',
  language: 'pt',
  currency: 'EUR',
  notifications: true,
};

export const createMockDatabase = (): MockDatabase => ({
  user: mockUser,
  household: mockHousehold,
  goals: [...mockGoals],
  accounts: [...mockAccounts],
  debts: [...mockDebts],
  incomes: [...mockIncomes],
  fixedCosts: [...mockFixedCosts],
  transactions: [...mockTransactions],
  settings: { ...mockSettings },
});

/**
 * In-memory database instance
 * Can be reset or modified during preview session
 */
let database: MockDatabase = createMockDatabase();

export const getMockDatabase = (): MockDatabase => database;

export const resetMockDatabase = (): void => {
  database = createMockDatabase();
};

export const updateMockDatabase = (updates: Partial<MockDatabase>): void => {
  database = { ...database, ...updates };
};

/**
 * Mock API functions that simulate Supabase operations
 */

export const mockAPI = {
  // Goals
  getGoals: async () => database.goals,
  getGoal: async (id: string) => database.goals.find(g => g.id === id),
  createGoal: async (goal: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    database.goals.push(newGoal);
    return newGoal;
  },
  updateGoal: async (id: string, updates: Partial<any>) => {
    const index = database.goals.findIndex(g => g.id === id);
    if (index !== -1) {
      database.goals[index] = {
        ...database.goals[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return database.goals[index];
    }
    return null;
  },
  deleteGoal: async (id: string) => {
    database.goals = database.goals.filter(g => g.id !== id);
  },

  // Accounts
  getAccounts: async () => database.accounts,
  createAccount: async (account: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount = {
      ...account,
      id: `account-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    database.accounts.push(newAccount);
    return newAccount;
  },
  updateAccount: async (id: string, updates: Partial<any>) => {
    const index = database.accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      database.accounts[index] = {
        ...database.accounts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return database.accounts[index];
    }
    return null;
  },
  deleteAccount: async (id: string) => {
    database.accounts = database.accounts.filter(a => a.id !== id);
  },

  // Debts
  getDebts: async () => database.debts,
  createDebt: async (debt: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDebt = {
      ...debt,
      id: `debt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    database.debts.push(newDebt);
    return newDebt;
  },
  updateDebt: async (id: string, updates: Partial<any>) => {
    const index = database.debts.findIndex(d => d.id === id);
    if (index !== -1) {
      database.debts[index] = {
        ...database.debts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return database.debts[index];
    }
    return null;
  },
  deleteDebt: async (id: string) => {
    database.debts = database.debts.filter(d => d.id !== id);
  },

  // Income
  getIncomes: async () => database.incomes,
  
  // Fixed Costs
  getFixedCosts: async () => database.fixedCosts,

  // Transactions
  getTransactions: async () => database.transactions,

  // Settings
  getSettings: async () => database.settings,
  updateSettings: async (updates: Partial<AppSettings>) => {
    database.settings = { ...database.settings, ...updates };
    return database.settings;
  },

  // User
  getUser: async () => database.user,
  updateUser: async (updates: Partial<any>) => {
    if (database.user) {
      database.user = { ...database.user, ...updates };
      return database.user;
    }
    return null;
  },

  // Household
  getHousehold: async () => database.household,
};
