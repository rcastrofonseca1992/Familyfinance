import React from 'react';
import { Account } from '../preview/types';
import { Wallet, PiggyBank, TrendingUp, Users } from 'lucide-react';

/**
 * Account Card Component
 * Pure UI component for displaying account information
 */

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

const getAccountIcon = (type: string) => {
  const icons: Record<string, any> = {
    checking: Wallet,
    savings: PiggyBank,
    investment: TrendingUp,
  };
  const Icon = icons[type] || Wallet;
  return <Icon className="w-5 h-5" />;
};

const getAccountTypeLabel = (type: string, language: string = 'pt') => {
  const labels: Record<string, Record<string, string>> = {
    checking: { en: 'Checking', pt: 'Corrente' },
    savings: { en: 'Savings', pt: 'Poupança' },
    investment: { en: 'Investment', pt: 'Investimento' },
  };
  return labels[type]?.[language] || type;
};

export const AccountCard: React.FC<AccountCardProps> = ({ account, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className="relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${account.color}20` }}
          >
            <div style={{ color: account.color }}>
              {getAccountIcon(account.type)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {account.name}
            </h3>
            <p className="text-xs uppercase tracking-wider text-gray-500">
              {getAccountTypeLabel(account.type)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Saldo</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(account.balance)}
        </p>
      </div>

      {/* Institution */}
      {account.institution && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500">{account.institution}</p>
        </div>
      )}
    </div>
  );
};
