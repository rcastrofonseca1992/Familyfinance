import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FinanceProvider, useFinance } from './components/store/FinanceContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { InvestmentForecastView } from './components/dashboard/InvestmentForecastView';
import { FeasibilityEngine } from './components/feasibility/FeasibilityEngine';
import { GoalsView } from './components/goals/GoalsView';
import { PersonalDashboard } from './components/personal/PersonalDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { HouseholdManagement } from './components/settings/HouseholdManagement';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { HouseholdSetup } from './components/onboarding/HouseholdSetup';
import { PWAHandler } from './components/utils/PWAHandler';
import { Toaster } from 'sonner';
import { Calendar, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { formatCurrency } from './lib/finance';
import { getLanguage } from './src/utils/i18n';

const MainApp: React.FC = () => {
  const { data, getPersonalNetWorth } = useFinance();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  // Initialize language on app startup
  useEffect(() => {
    document.documentElement.setAttribute("lang", getLanguage());
  }, []);

  // 1. Auth Layer
  if (!data.user) {
      if (authView === 'signup') {
          return <SignUpPage onNavigate={(page) => page === 'login' ? setAuthView('login') : null} />;
      }
      return <LoginPage onNavigate={(page) => page === 'signup' ? setAuthView('signup') : null} />;
  }

  // 2. Household Layer
  if (!data.household) {
      return <HouseholdSetup />;
  }

  // 3. App Layer
  const getHeaderInfo = () => {
      if (currentTab === 'forecast') {
        return {
            title: '',
            subtitle: null
        };
      }
      if (currentTab === 'dashboard') {
          const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          return {
              title: `${data.household?.name || "Household"} Dashboard`,
              subtitle: (
                  <div className="flex items-center gap-2 font-medium uppercase tracking-wide">
                      <Calendar size={14} />
                      {dateStr}
                  </div>
              )
          };
      }
      if (currentTab === 'goals') {
          return {
              title: 'Goals',
              subtitle: 'Track your progress towards life events.',
              action: (
                  <Button onClick={() => setIsGoalDialogOpen(true)} size="sm" className="gap-2">
                      <Plus size={16} /> New
                  </Button>
              )
          };
      }
      if (currentTab === 'settings') {
          return {
              title: 'Settings',
              subtitle: 'Preferences for your companion.'
          };
      }
      if (currentTab === 'household-management') {
          return {
              title: 'Manage Household',
              subtitle: 'Members & Permissions'
          };
      }
      if (currentTab === 'personal') {
          return {
            title: `Hi, ${data.user?.name}`,
            subtitle: 'Manage your personal finances.',
            action: (
                <div className="text-right">
                   <div className="text-xs text-muted-foreground">Personal Net Worth</div>
                   <div className="text-lg font-bold text-primary">{formatCurrency(getPersonalNetWorth())}</div>
               </div>
            )
          }
      }
      return { title: '', subtitle: null };
  };

  const { title, subtitle, action } = getHeaderInfo();

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard': return <HomeDashboard onNavigate={setCurrentTab} />;
      case 'forecast': return <InvestmentForecastView onBack={() => setCurrentTab('dashboard')} />;
      case 'personal': return <PersonalDashboard />;
      case 'feasibility': return <FeasibilityEngine />;
      case 'goals': return <GoalsView isAddOpen={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen} />;
      case 'settings': return <SettingsView onNavigate={setCurrentTab} />;
      case 'household-management': return <HouseholdManagement onBack={() => setCurrentTab('settings')} />;
      default: return <HomeDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <AppShell currentTab={currentTab} onTabChange={setCurrentTab} title={title} subtitle={subtitle} headerAction={action}>
        {renderView()}
        <PWAHandler />
    </AppShell>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <LanguageProvider>
          <MainApp />
          <Toaster />
        </LanguageProvider>
      </FinanceProvider>
    </ErrorBoundary>
  );
}