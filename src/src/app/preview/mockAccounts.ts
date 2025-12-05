import { Account } from './types';

/**
 * Mock accounts data for preview environment
 * Includes comprehensive examples: checking, savings, and investment accounts
 */

export const mockAccounts: Account[] = [
  // 1. CHECKING - Main Account
  {
    id: 'account-1',
    name: 'Conta Corrente Principal',
    type: 'checking',
    balance: 8450.75,
    institution: 'Banco Millennium',
    icon: 'Wallet',
    color: '#3b82f6',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 2. SAVINGS - Emergency Fund
  {
    id: 'account-2',
    name: 'Poupança',
    type: 'savings',
    balance: 18500.00,
    institution: 'CGD',
    icon: 'PiggyBank',
    color: '#10b981',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 3. CHECKING - Joint Account
  {
    id: 'account-3',
    name: 'Conta Conjunta',
    type: 'checking',
    balance: 3200.50,
    institution: 'Santander',
    icon: 'Users',
    color: '#8b5cf6',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 4. INVESTMENT - Stock Portfolio
  {
    id: 'account-4',
    name: 'Investimentos',
    type: 'investment',
    balance: 45000.00,
    institution: 'XTB',
    icon: 'TrendingUp',
    color: '#f59e0b',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 5. SAVINGS - Children's Education
  {
    id: 'account-5',
    name: 'Poupança Educação',
    type: 'savings',
    balance: 22000.00,
    institution: 'BPI',
    icon: 'GraduationCap',
    color: '#06b6d4',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 6. INVESTMENT - Retirement Fund
  {
    id: 'account-6',
    name: 'PPR - Reforma',
    type: 'investment',
    balance: 68500.00,
    institution: 'Banco Invest',
    icon: 'Landmark',
    color: '#ec4899',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
];