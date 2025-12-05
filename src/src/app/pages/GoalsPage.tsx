import React, { useState } from 'react';
import { Goal } from '../preview/types';
import { GoalCard } from '../components/GoalCard';
import { Target, Plus, Filter, ArrowLeft } from 'lucide-react';

/**
 * Goals Page Component
 * Full list of all financial goals with filtering
 */

interface GoalsPageProps {
  goals: Goal[];
  onGoalClick?: (goal: Goal) => void;
  onBack?: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onGoalClick,
  onBack,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(g => g.category === filter);

  const categories = [
    { value: 'all', label: 'Todos', count: goals.length },
    { value: 'mortgage', label: 'Casa', count: goals.filter(g => g.category === 'mortgage').length },
    { value: 'emergency', label: 'Emergência', count: goals.filter(g => g.category === 'emergency').length },
    { value: 'travel', label: 'Viagem', count: goals.filter(g => g.category === 'travel').length },
    { value: 'car', label: 'Carro', count: goals.filter(g => g.category === 'car').length },
    { value: 'kids', label: 'Filhos', count: goals.filter(g => g.category === 'kids').length },
    { value: 'general', label: 'Geral', count: goals.filter(g => g.category === 'general').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 pb-12">
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
              <h1 className="text-3xl font-bold mb-2">Objetivos Financeiros</h1>
              <p className="text-blue-100">{goals.length} objetivo{goals.length !== 1 ? 's' : ''} ativo{goals.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 font-semibold">
              <Plus className="w-5 h-5" />
              Novo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-xl border border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  filter === cat.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {cat.label}
                <span className={`ml-2 ${
                  filter === cat.value ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  ({cat.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum Objetivo Encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Comece criando o seu primeiro objetivo financeiro.'
                : 'Não existem objetivos nesta categoria.'}
            </p>
            <button className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Objetivo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => onGoalClick?.(goal)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
