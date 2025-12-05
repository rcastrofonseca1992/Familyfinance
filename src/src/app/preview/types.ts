/**
 * Shared TypeScript types for Figma Make preview environment
 * These types mirror the production database schema
 */

export type GoalCategory = 'mortgage' | 'emergency' | 'travel' | 'car' | 'kids' | 'general';

export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  image: string;
  deadline: string; // ISO date string
  requiredMonthlyContribution: number;
  propertyValue?: number; // For home/mortgage goals
  loanToValue?: number; // For home/mortgage goals
  expectedAPY?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  institution?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'personal_loan' | 'mortgage' | 'student_loan' | 'auto_loan' | 'other';
  balance: number;
  interestRate: number;
  minimumPayment: number;
  institution?: string;
  dueDate?: string; // Day of month
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'annual';
  createdAt: string;
  updatedAt: string;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  householdId?: string;
  language: 'en' | 'pt';
  currency: string;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'pt';
  currency: string;
  notifications: boolean;
}

export interface MockDatabase {
  user: User | null;
  household: Household | null;
  goals: Goal[];
  accounts: Account[];
  debts: Debt[];
  incomes: Income[];
  fixedCosts: FixedCost[];
  transactions: Transaction[];
  settings: AppSettings;
}

export interface MockAuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}
