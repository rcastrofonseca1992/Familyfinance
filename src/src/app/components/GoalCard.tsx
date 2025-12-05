import React from 'react';
import { Goal } from '../preview/types';
import { 
  Home, 
  ShieldAlert, 
  Plane, 
  Car, 
  Users, 
  PiggyBank,
  Calendar,
  TrendingUp,
  Target,
} from 'lucide-react';

/**
 * Goal Card Component
 * Pure UI component that accepts goal data as props
 */

interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    mortgage: Home,
    emergency: ShieldAlert,
    travel: Plane,
    car: Car,
    kids: Users,
    general: PiggyBank,
  };
  const Icon = icons[category] || Target;
  return <Icon className="w-5 h-5" />;
};

const getCategoryLabel = (category: string, language: string = 'pt') => {
  const labels: Record<string, Record<string, string>> = {
    mortgage: { en: 'Home', pt: 'Casa' },
    emergency: { en: 'Emergency Fund', pt: 'Fundo de Emergência' },
    travel: { en: 'Travel', pt: 'Viagem' },
    car: { en: 'Car', pt: 'Carro' },
    kids: { en: 'Kids/Family', pt: 'Filhos/Família' },
    general: { en: 'Savings', pt: 'Poupança' },
  };
  return labels[category]?.[language] || category;
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const monthsLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 h-full flex flex-col cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Hero Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={goal.image}
          alt={goal.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
          <div className="text-blue-600 dark:text-blue-400">
            {getCategoryIcon(goal.category)}
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
            {getCategoryLabel(goal.category)}
          </span>
        </div>

        {/* Deadline Badge */}
        <div className="absolute top-3 right-3 text-xs font-mono bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          <Calendar className="w-3 h-3" />
          {new Date(goal.deadline).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Tags */}
        {goal.tags && goal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {goal.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Name & Target */}
        <div>
          <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-1">
            {goal.name}
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(goal.targetAmount)}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} restantes</span>
          </div>
        </div>

        {/* Market Context */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Faltam</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {monthsLeft} meses
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Mensal</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(goal.requiredMonthlyContribution)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
