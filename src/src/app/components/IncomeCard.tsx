import React from 'react';
import { Income } from '../preview/types';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

/**
 * Income Card Component
 * Pure UI component for displaying income sources
 */

interface IncomeCardProps {
  income: Income;
  onClick?: () => void;
}

const getFrequencyLabel = (frequency: string, language: string = 'pt') => {
  const labels: Record<string, Record<string, string>> = {
    monthly: { en: 'Monthly', pt: 'Mensal' },
    biweekly: { en: 'Biweekly', pt: 'Quinzenal' },
    weekly: { en: 'Weekly', pt: 'Semanal' },
    annual: { en: 'Annual', pt: 'Anual' },
  };
  return labels[frequency]?.[language] || frequency;
};

export const IncomeCard: React.FC<IncomeCardProps> = ({ income, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className="relative p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {income.source}
            </h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getFrequencyLabel(income.frequency)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(income.amount)}
          </p>
        </div>
      </div>
    </div>
  );
};
