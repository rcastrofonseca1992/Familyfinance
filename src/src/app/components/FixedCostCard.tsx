import React from 'react';
import { FixedCost } from '../preview/types';
import { Receipt, Calendar, Tag } from 'lucide-react';

/**
 * Fixed Cost Card Component
 * Pure UI component for displaying fixed costs (subscriptions/bills)
 */

interface FixedCostCardProps {
  fixedCost: FixedCost;
  onClick?: () => void;
}

const getFrequencyLabel = (frequency: string, language: string = 'pt') => {
  const labels: Record<string, Record<string, string>> = {
    monthly: { en: 'Monthly', pt: 'Mensal' },
    annual: { en: 'Annual', pt: 'Anual' },
  };
  return labels[frequency]?.[language] || frequency;
};

export const FixedCostCard: React.FC<FixedCostCardProps> = ({ fixedCost, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className="relative p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {fixedCost.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {getFrequencyLabel(fixedCost.frequency)}
              </span>
              {fixedCost.category && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {fixedCost.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(fixedCost.amount)}
          </p>
          {fixedCost.dueDate && (
            <p className="text-xs text-gray-500">Dia {fixedCost.dueDate}</p>
          )}
        </div>
      </div>
    </div>
  );
};
