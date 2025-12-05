import { Transaction, Income, FixedCost } from './types';

/**
 * Mock transactions, incomes, and fixed costs for preview environment
 * Comprehensive examples with different frequencies and categories
 */

export const mockIncomes: Income[] = [
  // 1. MONTHLY - Primary Salary
  {
    id: 'income-1',
    source: 'Salário Principal',
    amount: 3200.00,
    frequency: 'monthly',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 2. MONTHLY - Spouse Salary
  {
    id: 'income-2',
    source: 'Salário Cônjuge',
    amount: 2800.00,
    frequency: 'monthly',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 3. MONTHLY - Freelance Work
  {
    id: 'income-3',
    source: 'Freelance',
    amount: 500.00,
    frequency: 'monthly',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 4. ANNUAL - Bonus
  {
    id: 'income-4',
    source: 'Bónus Anual',
    amount: 5000.00,
    frequency: 'annual',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 5. BIWEEKLY - Side Gig
  {
    id: 'income-5',
    source: 'Trabalho Extra',
    amount: 300.00,
    frequency: 'biweekly',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 6. MONTHLY - Rental Income
  {
    id: 'income-6',
    source: 'Arrendamento',
    amount: 650.00,
    frequency: 'monthly',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
];

export const mockFixedCosts: FixedCost[] = [
  // 1. MONTHLY - Rent/Mortgage
  {
    id: 'fixed-1',
    name: 'Renda',
    amount: 850.00,
    frequency: 'monthly',
    category: 'Habitação',
    dueDate: '1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 2. MONTHLY - Electricity
  {
    id: 'fixed-2',
    name: 'Eletricidade',
    amount: 120.00,
    frequency: 'monthly',
    category: 'Utilidades',
    dueDate: '15',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 3. MONTHLY - Water
  {
    id: 'fixed-3',
    name: 'Água',
    amount: 35.00,
    frequency: 'monthly',
    category: 'Utilidades',
    dueDate: '15',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 4. MONTHLY - Internet + TV
  {
    id: 'fixed-4',
    name: 'Internet + TV',
    amount: 45.00,
    frequency: 'monthly',
    category: 'Utilidades',
    dueDate: '10',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 5. MONTHLY - Netflix
  {
    id: 'fixed-5',
    name: 'Netflix',
    amount: 15.99,
    frequency: 'monthly',
    category: 'Entretenimento',
    dueDate: '5',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 6. MONTHLY - Spotify
  {
    id: 'fixed-6',
    name: 'Spotify',
    amount: 9.99,
    frequency: 'monthly',
    category: 'Entretenimento',
    dueDate: '12',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 7. MONTHLY - Gym Membership
  {
    id: 'fixed-7',
    name: 'Ginásio',
    amount: 35.00,
    frequency: 'monthly',
    category: 'Saúde',
    dueDate: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 8. MONTHLY - Phone Bill
  {
    id: 'fixed-8',
    name: 'Telemóvel',
    amount: 25.00,
    frequency: 'monthly',
    category: 'Utilidades',
    dueDate: '20',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 9. ANNUAL - Car Insurance
  {
    id: 'fixed-9',
    name: 'Seguro Automóvel',
    amount: 450.00,
    frequency: 'annual',
    category: 'Seguros',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 10. ANNUAL - Home Insurance
  {
    id: 'fixed-10',
    name: 'Seguro Habitação',
    amount: 280.00,
    frequency: 'annual',
    category: 'Seguros',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 11. MONTHLY - Daycare
  {
    id: 'fixed-11',
    name: 'Creche',
    amount: 380.00,
    frequency: 'monthly',
    category: 'Educação',
    dueDate: '1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 12. MONTHLY - Public Transport
  {
    id: 'fixed-12',
    name: 'Passe Mensal',
    amount: 40.00,
    frequency: 'monthly',
    category: 'Transporte',
    dueDate: '1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
];

export const mockTransactions: Transaction[] = [
  // Income transactions
  {
    id: 'tx-1',
    accountId: 'account-1',
    amount: 3200.00,
    type: 'income',
    category: 'Salário',
    description: 'Salário Dezembro',
    date: '2024-12-01T10:00:00Z',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'tx-2',
    accountId: 'account-1',
    amount: 2800.00,
    type: 'income',
    category: 'Salário',
    description: 'Salário Cônjuge',
    date: '2024-12-01T10:00:00Z',
    createdAt: '2024-12-01T10:00:00Z',
  },
  
  // Fixed costs
  {
    id: 'tx-3',
    accountId: 'account-1',
    amount: -850.00,
    type: 'expense',
    category: 'Habitação',
    description: 'Renda',
    date: '2024-12-01T10:00:00Z',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'tx-4',
    accountId: 'account-1',
    amount: -120.00,
    type: 'expense',
    category: 'Utilidades',
    description: 'Eletricidade',
    date: '2024-12-15T10:00:00Z',
    createdAt: '2024-12-15T10:00:00Z',
  },
  
  // Variable expenses
  {
    id: 'tx-5',
    accountId: 'account-1',
    amount: -75.50,
    type: 'expense',
    category: 'Alimentação',
    description: 'Supermercado',
    date: '2024-12-03T10:00:00Z',
    createdAt: '2024-12-03T10:00:00Z',
  },
  {
    id: 'tx-6',
    accountId: 'account-1',
    amount: -42.00,
    type: 'expense',
    category: 'Restaurantes',
    description: 'Jantar Família',
    date: '2024-12-04T19:30:00Z',
    createdAt: '2024-12-04T19:30:00Z',
  },
  
  // Savings transfer
  {
    id: 'tx-7',
    accountId: 'account-2',
    amount: 500.00,
    type: 'transfer',
    category: 'Poupança',
    description: 'Poupança mensal',
    date: '2024-12-02T10:00:00Z',
    createdAt: '2024-12-02T10:00:00Z',
  },
  
  // Investment contribution
  {
    id: 'tx-8',
    accountId: 'account-4',
    amount: 750.00,
    type: 'transfer',
    category: 'Investimento',
    description: 'Contribuição mensal',
    date: '2024-12-02T10:00:00Z',
    createdAt: '2024-12-02T10:00:00Z',
  },
];