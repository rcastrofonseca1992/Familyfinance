import React from 'react';
import { Goal, Account, Debt } from '../preview/types';
import { GoalCard } from '../components/GoalCard';
import { TrendingUp, Target, Wallet, AlertCircle, Plus, Home } from 'lucide-react';

/**
 * Dashboard Page Component
 * Main overview page with goals, accounts, and financial summary
 */

interface DashboardPageProps {
  goals: Goal[];
  accounts: Account[];
  debts: Debt[];
  onGoalClick?: (goal: Goal) => void;
  onNavigate?: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  goals,
  accounts,
  debts,
  onGoalClick,
  onNavigate,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const netWorth = totalAssets - totalDebts;
  const totalGoalsTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalsSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalGoalsSaved / totalGoalsTarget) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-blue-100">Visão Geral Financeira</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
              <Home className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Net Worth */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Patrimônio Líquido</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(netWorth)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Ativos: {formatCurrency(totalAssets)}
            </p>
          </div>

          {/* Goals Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Progresso Objetivos</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {overallProgress.toFixed(1)}%
            </p>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Total Debts */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Dívidas Totais</p>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalDebts)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {debts.length} dívida{debts.length !== 1 ? 's' : ''} ativa{debts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Meus Objetivos
            </h2>
            <button
              onClick={() => onNavigate?.('goals')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ver Todos
            </button>
          </div>
          
          {goals.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum Objetivo Criado
              </h3>
              <p className="text-gray-500 mb-4">
                Comece a planear o seu futuro financeiro criando objetivos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.slice(0, 3).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => onGoalClick?.(goal)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => onNavigate?.('goals')}
            className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all text-left"
          >
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-gray-100">Objetivos</p>
            <p className="text-xs text-gray-500">{goals.length} ativos</p>
          </button>

          <button
            onClick={() => onNavigate?.('accounts')}
            className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all text-left"
          >
            <Wallet className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-gray-100">Contas</p>
            <p className="text-xs text-gray-500">{accounts.length} contas</p>
          </button>

          <button
            onClick={() => onNavigate?.('debts')}
            className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all text-left"
          >
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-gray-100">Dívidas</p>
            <p className="text-xs text-gray-500">{debts.length} ativas</p>
          </button>

          <button
            onClick={() => onNavigate?.('settings')}
            className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all text-left"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-gray-100">Análise</p>
            <p className="text-xs text-gray-500">Ver relatórios</p>
          </button>
        </div>
      </div>
    </div>
  );
};
