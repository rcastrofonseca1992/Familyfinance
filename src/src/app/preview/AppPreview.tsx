import React, { useState, useEffect } from 'react';
import { getMockDatabase, mockAPI } from './mockDatabase';
import { createMockAuth } from './mockAuth';
import { DashboardPage } from '../pages/DashboardPage';
import { GoalsPage } from '../pages/GoalsPage';
import { PersonalFinancePage } from '../pages/PersonalFinancePage';
import { Goal } from './types';
import './devUtils'; // Load dev utilities

/**
 * AppPreview Component
 * Main preview entry point - renders entire app with mock data
 * Automatically activated when running inside iframe
 */

type Page = 'dashboard' | 'goals' | 'personal-finance' | 'goal-detail';

export const AppPreview: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [database] = useState(() => getMockDatabase());
  const [auth] = useState(() => createMockAuth());

  useEffect(() => {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║       🎨 FIGMA MAKE PREVIEW MODE 🎨             ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log('║  ✓ Mock data active                              ║');
    console.log('║  ✓ No Supabase calls                             ║');
    console.log('║  ✓ Isolated preview environment                  ║');
    console.log('║  ✓ Full UI functionality                         ║');
    console.log('╚═══════════════════════════════════════════════════╝');
  }, []);

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setCurrentPage('goal-detail');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    if (page !== 'goal-detail') {
      setSelectedGoal(null);
    }
  };

  const handleBack = () => {
    if (currentPage === 'goal-detail') {
      setCurrentPage('goals');
    } else {
      setCurrentPage('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Preview Mode Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-center text-sm font-semibold shadow-lg">
        🎨 FIGMA MAKE PREVIEW MODE · Mock Data Active
      </div>

      <div className="pt-10">
        {currentPage === 'dashboard' && (
          <DashboardPage
            goals={database.goals}
            accounts={database.accounts}
            debts={database.debts}
            onGoalClick={handleGoalClick}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'goals' && (
          <GoalsPage
            goals={database.goals}
            onGoalClick={handleGoalClick}
            onBack={handleBack}
          />
        )}

        {currentPage === 'personal-finance' && (
          <PersonalFinancePage
            accounts={database.accounts}
            debts={database.debts}
            incomes={database.incomes}
            fixedCosts={database.fixedCosts}
            onBack={handleBack}
          />
        )}

        {currentPage === 'goal-detail' && selectedGoal && (
          <div className="max-w-7xl mx-auto p-6">
            <button
              onClick={handleBack}
              className="mb-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              ← Voltar
            </button>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {selectedGoal.name}
              </h1>
              <img
                src={selectedGoal.image}
                alt={selectedGoal.name}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Objetivo</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(selectedGoal.targetAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Poupado</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(selectedGoal.currentAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contribuição Mensal</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('pt-PT', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(selectedGoal.requiredMonthlyContribution)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prazo</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(selectedGoal.deadline).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex justify-around items-center px-4 py-3">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigate('goals')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'goals' || currentPage === 'goal-detail'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Objetivos</span>
          </button>

          <button
            onClick={() => handleNavigate('personal-finance')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'personal-finance'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs font-medium">Finanças</span>
          </button>
        </div>
      </div>

      <div className="h-20" /> {/* Spacer for fixed nav */}
    </div>
  );
};

export default AppPreview;