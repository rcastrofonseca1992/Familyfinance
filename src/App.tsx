import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FinanceProvider, useFinance } from './components/store/FinanceContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { InvestmentForecastView } from './components/dashboard/InvestmentForecastView';
import { FIREView } from './components/dashboard/FIREView';
import { FeasibilityEngine } from './components/feasibility/FeasibilityEngine';
import { GoalsView } from './components/goals/GoalsView';
import { PersonalDashboard } from './components/personal/PersonalDashboard';
import { IncomePage } from './components/personal/IncomePage';
import { AccountsPage } from './components/personal/AccountsPage';
import { DebtsPage } from './components/personal/DebtsPage';
import { FixedCostsPage } from './components/personal/FixedCostsPage';
import { SettingsView } from './components/settings/SettingsView';
import { HouseholdManagement } from './components/settings/HouseholdManagement';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { EmailVerificationScreen } from './components/auth/EmailVerificationScreen';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { HouseholdSetup } from './components/onboarding/HouseholdSetup';
import { PWAHandler } from './components/utils/PWAHandler';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Toaster } from 'sonner';
import { Calendar, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { formatCurrency } from './lib/finance';
import { getLanguage } from './src/utils/i18n';
import { isFigmaPreview, logPreviewMode } from './lib/figma-preview';
import { PublicHomePage } from './components/public/PublicHomePage';
import { useIsPWA } from './components/utils/useIsPWA';

const MainApp: React.FC = () => {
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const allowedViews = new Set([
      'dashboard',
      'forecast',
      'fire',
      'personal',
      'me/income',
      'me/accounts',
      'me/debts',
      'me/fixed-costs',
      'feasibility',
      'goals',
      'settings',
      'household-management',
    ]);

    if (view && allowedViews.has(view)) {
      return view;
    }
    return 'dashboard';
  };

  const { data, getPersonalNetWorth, isInitialized, logout } = useFinance();
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email'>('login');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Initialize language on app startup
  useEffect(() => {
    document.documentElement.setAttribute("lang", getLanguage());
    // Log preview mode status
    logPreviewMode();

    const params = new URLSearchParams(window.location.search);
    if (params.has('view')) {
      params.delete('view');
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Check if we're on reset password route (from email link)
    if (window.location.pathname === '/auth/reset-password' || window.location.hash.includes('type=recovery')) {
      setAuthView('reset-password');
    }

    if (window.location.pathname === '/signup') {
      setAuthView('signup');
    } else if (window.location.pathname === '/login') {
      setAuthView('login');
    }
  }, []);

  // Show loading screen while initializing (except during auth/onboarding flows)
  if (!isInitialized && !isFigmaPreview) {
    return <LoadingScreen />;
  }

  // 1. Auth Layer - Skip in Figma Preview
  if (!data.user && !isFigmaPreview) {
      // Show verification screen if user just signed up
      if (authView === 'verify-email') {
          return <EmailVerificationScreen email={verificationEmail} onLogout={() => {
            setAuthView('login');
            setVerificationEmail('');
          }} />;
      }
      if (authView === 'signup') {
          return <SignUpPage onNavigate={(page, email) => {
            if (page === 'login') setAuthView('login');
            else if (page === 'verify-email' && email) {
              setVerificationEmail(email);
              setAuthView('verify-email');
            }
          }} />;
      }
      if (authView === 'forgot-password') {
          return <ForgotPasswordPage onBack={() => setAuthView('login')} />;
      }
      if (authView === 'reset-password') {
          return <ResetPasswordPage onSuccess={() => setAuthView('login')} />;
      }
      return <LoginPage onNavigate={(page) => {
          if (page === 'signup') setAuthView('signup');
          else if (page === 'forgot-password') setAuthView('forgot-password');
      }} />;
  }

  // 1.5. Email Verification Layer - Skip in Figma Preview
  if (data.user && data.isEmailVerified === false && !isFigmaPreview) {
      setVerificationEmail(data.user.email);
      return <EmailVerificationScreen email={data.user.email} onLogout={logout} />;
  }

  // 2. Household Layer - Skip in Figma Preview
  if (!data.household && !isFigmaPreview) {
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
      // Default
      return { title: '', subtitle: null };
  };

  const { title, subtitle, action } = getHeaderInfo();

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard': return <HomeDashboard onNavigate={setCurrentTab} />;
      case 'forecast': return <InvestmentForecastView onBack={() => setCurrentTab('dashboard')} />;
      case 'fire': return <FIREView onBack={() => setCurrentTab('dashboard')} />;
      case 'personal': return <PersonalDashboard onNavigate={setCurrentTab} />;
      case 'me/income': return <IncomePage onNavigate={setCurrentTab} />;
      case 'me/accounts': return <AccountsPage onNavigate={setCurrentTab} />;
      case 'me/debts': return <DebtsPage onNavigate={setCurrentTab} />;
      case 'me/fixed-costs': return <FixedCostsPage onNavigate={setCurrentTab} />;
      case 'feasibility': return <FeasibilityEngine />;
      case 'goals': return <GoalsView isAddOpen={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen} />;
      case 'settings': return <SettingsView onNavigate={setCurrentTab} />;
      case 'household-management': return <HouseholdManagement onBack={() => setCurrentTab('settings')} />;
      default: return <HomeDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <AppShell currentTab={currentTab} onTabChange={setCurrentTab} title={title} subtitle={subtitle} headerAction={action}>
        <div className="animate-in fade-in duration-500">
          {renderView()}
        </div>
        <PWAHandler />
    </AppShell>
  );
};

export default function App() {
  const isPWA = useIsPWA();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublicHomeRoute = !isPWA && (pathname === '/' || pathname === '/home');

  if (isPublicHomeRoute) {
    return (
      <ErrorBoundary>
        <LanguageProvider>
          <PublicHomePage />
          <Toaster position="top-center" />
        </LanguageProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <FinanceProvider>
        <LanguageProvider>
          <MainApp />
          <Toaster position="top-center" />
        </LanguageProvider>
      </FinanceProvider>
    </ErrorBoundary>
  );
}