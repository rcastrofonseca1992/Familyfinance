import { User, Household } from './types';

/**
 * Mock user and household data for preview environment
 */

export const mockUser: User = {
  id: 'user-1',
  email: 'demo@familyfinance.app',
  name: 'João Silva',
  householdId: 'household-1',
  language: 'pt',
  currency: 'EUR',
  createdAt: '2024-01-01T10:00:00Z',
};

export const mockHousehold: Household = {
  id: 'household-1',
  name: 'Família Silva',
  inviteCode: 'SILVA2024',
  monthlyIncome: 4500.00,
  monthlyExpenses: 3200.00,
  createdAt: '2024-01-01T10:00:00Z',
};
