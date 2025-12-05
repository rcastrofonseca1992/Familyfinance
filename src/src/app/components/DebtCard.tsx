import React from 'react';
import { Debt } from '../preview/types';
import { CreditCard, Home, Car, GraduationCap, User, AlertCircle } from 'lucide-react';

/**
 * Debt Card Component
 * Pure UI component for displaying debt information
 */

interface DebtCardProps {
  debt: Debt;
  onClick?: () => void;
}

const getDebtIcon = (type: string) => {
  const icons: Record<string, any> = {
    credit_card: CreditCard,
    mortgage: Home,
    auto_loan: Car,
    student_loan: GraduationCap,
    personal_loan: User,
    other: AlertCircle,
  };
  const Icon = icons[type] || AlertCircle;
  return <Icon className="w-5 h-5" />;
};

const getDebtTypeLabel = (type: string, language: string = 'pt') => {
  const labels: Record<string, Record<string, string>> = {
    credit_card: { en: 'Credit Card', pt: 'Cartão de Crédito' },
    mortgage: { en: 'Mortgage', pt: 'Crédito Habitação' },
    auto_loan: { en: 'Auto Loan', pt: 'Crédito Automóvel' },
    student_loan: { en: 'Student Loan', pt: 'Crédito Estudantil' },
    personal_loan: { en: 'Personal Loan', pt: 'Empréstimo Pessoal' },
    other: { en: 'Other', pt: 'Outro' },
  };
  return labels[type]?.[language] || type;
};

export const DebtCard: React.FC<DebtCardProps> = ({ debt, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className="relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            {getDebtIcon(debt.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {debt.name}
            </h3>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              {getDebtTypeLabel(debt.type)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Saldo Devedor</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {formatCurrency(debt.balance)}
        </p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-500 mb-1">Taxa de Juro</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {debt.interestRate.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Pagamento Mínimo</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(debt.minimumPayment)}
          </p>
        </div>
      </div>

      {/* Institution & Due Date */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs text-gray-500">
        {debt.institution && <span>{debt.institution}</span>}
        {debt.dueDate && <span>Vencimento: dia {debt.dueDate}</span>}
      </div>
    </div>
  );
};
