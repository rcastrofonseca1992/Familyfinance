import { Debt } from './types';

/**
 * Mock debts data for preview environment
 * Includes credit card, personal loan, and mortgage
 */

export const mockDebts: Debt[] = [
  {
    id: 'debt-1',
    name: 'Cartão de Crédito Principal',
    type: 'credit_card',
    balance: 3500.00,
    interestRate: 18.5,
    minimumPayment: 175.00,
    institution: 'Banco Millennium',
    dueDate: '15',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  {
    id: 'debt-2',
    name: 'Empréstimo Pessoal',
    type: 'personal_loan',
    balance: 8500.00,
    interestRate: 7.2,
    minimumPayment: 450.00,
    institution: 'CGD',
    dueDate: '10',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  {
    id: 'debt-3',
    name: 'Crédito Habitação',
    type: 'mortgage',
    balance: 185000.00,
    interestRate: 3.8,
    minimumPayment: 1250.00,
    institution: 'Santander',
    dueDate: '1',
    createdAt: '2020-03-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  {
    id: 'debt-4',
    name: 'Crédito Automóvel',
    type: 'auto_loan',
    balance: 12500.00,
    interestRate: 5.5,
    minimumPayment: 320.00,
    institution: 'BPI',
    dueDate: '20',
    createdAt: '2022-09-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
];
