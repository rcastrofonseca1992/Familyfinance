import React, { useState } from 'react';
import { Account, Debt, Income, FixedCost } from '../preview/types';
import { AccountCard } from '../components/AccountCard';
import { DebtCard } from '../components/DebtCard';
import { IncomeCard } from '../components/IncomeCard';
import { FixedCostCard } from '../components/FixedCostCard';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Personal Finance Page Component
 * Comprehensive view of Income, Accounts, Fixed Costs, and Debts
 */

interface PersonalFinancePageProps {
  accounts: Account[];
  debts: Debt[];
  incomes: Income[];
  fixedCosts: FixedCost[];
  onBack?: () => void;
}

export const PersonalFinancePage: React.FC<PersonalFinancePageProps> = ({
  accounts,
  debts,
  incomes,
  fixedCosts,
  onBack,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    income: true,
    accounts: true,
    fixedCosts: true,
    debts: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const totalIncome = incomes.reduce((sum, inc) => {
    const multiplier = inc.frequency === 'annual' ? 1/12 : 
                      inc.frequency === 'weekly' ? 4.33 :
                      inc.frequency === 'biweekly' ? 2 : 1;
    return sum + (inc.amount * multiplier);
  }, 0);

  const totalFixedCosts = fixedCosts.reduce((sum, cost) => {
    const multiplier = cost.frequency === 'annual' ? 1/12 : 1;
    return sum + (cost.amount * multiplier);
  }, 0);

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyDebtPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

  const netMonthlyFlow = totalIncome - totalFixedCosts - monthlyDebtPayments;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Finanças Pessoais</h1>
              <p className="text-purple-100">Visão completa do seu dinheiro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-xs uppercase tracking-wider text-green-100 mb-2">Receita Mensal</p>
            <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-xs uppercase tracking-wider text-blue-100 mb-2">Ativos Totais</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAssets)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-xs uppercase tracking-wider text-orange-100 mb-2">Custos Fixos</p>
            <p className="text-3xl font-bold">{formatCurrency(totalFixedCosts)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-xl text-white">
            <p className="text-xs uppercase tracking-wider text-red-100 mb-2">Dívidas</p>
            <p className="text-3xl font-bold">{formatCurrency(totalDebts)}</p>
          </div>
        </div>

        {/* Net Flow Card */}
        <div className={`mb-8 p-6 rounded-2xl shadow-xl border ${
          netMonthlyFlow >= 0 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                Fluxo Mensal Líquido
              </p>
              <p className={`text-4xl font-bold ${
                netMonthlyFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(netMonthlyFlow)}
              </p>
            </div>
            <TrendingUp className={`w-12 h-12 ${
              netMonthlyFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Receitas - Custos Fixos - Pagamentos Dívidas
          </p>
        </div>

        {/* Income Section */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('income')}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Receitas
                </h2>
                <p className="text-sm text-gray-500">
                  {incomes.length} fonte{incomes.length !== 1 ? 's' : ''} · {formatCurrency(totalIncome)}/mês
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              {expandedSections.income ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          {expandedSections.income && (
            <div className="bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 p-6 space-y-3">
              {incomes.map(income => (
                <IncomeCard key={income.id} income={income} />
              ))}
            </div>
          )}
        </div>

        {/* Accounts Section */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('accounts')}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Contas
                </h2>
                <p className="text-sm text-gray-500">
                  {accounts.length} conta{accounts.length !== 1 ? 's' : ''} · {formatCurrency(totalAssets)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              {expandedSections.accounts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          {expandedSections.accounts && (
            <div className="bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map(account => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Costs Section */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('fixedCosts')}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Custos Fixos
                </h2>
                <p className="text-sm text-gray-500">
                  {fixedCosts.length} custo{fixedCosts.length !== 1 ? 's' : ''} · {formatCurrency(totalFixedCosts)}/mês
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              {expandedSections.fixedCosts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          {expandedSections.fixedCosts && (
            <div className="bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 p-6 space-y-3">
              {fixedCosts.map(cost => (
                <FixedCostCard key={cost.id} fixedCost={cost} />
              ))}
            </div>
          )}
        </div>

        {/* Debts Section */}
        {debts.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => toggleSection('debts')}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-t-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Dívidas
                  </h2>
                  <p className="text-sm text-gray-500">
                    {debts.length} dívida{debts.length !== 1 ? 's' : ''} · {formatCurrency(totalDebts)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                {expandedSections.debts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>
            {expandedSections.debts && (
              <div className="bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {debts.map(debt => (
                    <DebtCard key={debt.id} debt={debt} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
