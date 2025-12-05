import { Goal } from './types';

/**
 * Mock goals data for preview environment
 * Includes comprehensive examples with at least one goal for each category
 */

export const mockGoals: Goal[] = [
  // 1. MORTGAGE - Dream Home
  {
    id: 'goal-1',
    name: 'Casa dos Sonhos',
    category: 'mortgage',
    targetAmount: 350000,
    currentAmount: 87500,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    deadline: '2028-12-31',
    requiredMonthlyContribution: 2850,
    propertyValue: 350000,
    loanToValue: 80,
    expectedAPY: 3.5,
    tags: ['Casa', 'Prioridade Alta'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 2. EMERGENCY FUND - 6 months coverage
  {
    id: 'goal-2',
    name: 'Fundo de Emergência',
    category: 'emergency',
    targetAmount: 30000,
    currentAmount: 18500,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    deadline: '2025-12-31',
    requiredMonthlyContribution: 890,
    expectedAPY: 4.0,
    tags: ['Essencial', 'Segurança'],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 3. TRAVEL - Japan Trip
  {
    id: 'goal-3',
    name: 'Viagem ao Japão',
    category: 'travel',
    targetAmount: 12000,
    currentAmount: 4200,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    deadline: '2026-06-30',
    requiredMonthlyContribution: 420,
    expectedAPY: 3.0,
    tags: ['Viagem', 'Família'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 4. CAR - New Vehicle
  {
    id: 'goal-4',
    name: 'Carro Novo',
    category: 'car',
    targetAmount: 35000,
    currentAmount: 12000,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    deadline: '2026-12-31',
    requiredMonthlyContribution: 920,
    expectedAPY: 3.2,
    tags: ['Transporte'],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 5. KIDS - Children's Education
  {
    id: 'goal-5',
    name: 'Educação dos Filhos',
    category: 'kids',
    targetAmount: 80000,
    currentAmount: 22000,
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    deadline: '2030-09-01',
    requiredMonthlyContribution: 750,
    expectedAPY: 4.5,
    tags: ['Educação', 'Futuro'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  
  // 6. GENERAL - Flexible Savings
  {
    id: 'goal-6',
    name: 'Poupança Geral',
    category: 'general',
    targetAmount: 50000,
    currentAmount: 31000,
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    deadline: '2027-12-31',
    requiredMonthlyContribution: 450,
    expectedAPY: 3.8,
    tags: ['Poupança', 'Flexível'],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
];