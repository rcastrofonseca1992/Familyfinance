// src/App.tsx
import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FinanceProvider, useFinance } from "./store/FinanceContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppShell } from "./components/layout/AppShell";

import { HomeDashboard } from "./components/dashboard/HomeDashboard";
import { InvestmentForecastView } from "./components/dashboard/InvestmentForecastView";
import { FIREView } from "./components/dashboard/FIREView";
import { FeasibilityEngine } from "./components/feasibility/FeasibilityEngine";
import { GoalsView } from "./components/goals/GoalsView";

import { PersonalDashboard } from "./components/personal/PersonalDashboard";
import { IncomePage } from "./components/personal/IncomePage";
import { AccountsPage } from "./components/personal/AccountsPage";
import { DebtsPage } from "./components/personal/DebtsPage";
import { FixedCostsPage } from "./components/personal/FixedCostsPage";

import { SettingsView } from "./components/settings/SettingsView";
import { HouseholdManagement } from "./components/settings/HouseholdManagement";

import { LoginPage } from "./components/auth/LoginPage";
import { SignUpPage } from "./components/auth/SignUpPage";
import { EmailVerificationScreen } from "./components/auth/EmailVerificationScreen";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/auth/ResetPasswordPage";

import { HouseholdSetup } from "./components/onboarding/HouseholdSetup";
import { PWAHandler } from "./components/utils/PWAHandler";
import { LoadingScreen } from "./ui/LoadingScreen";

import { Toaster } from "sonner";
import { Calendar, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { getLanguage } from "./utils/i18n";

const MainApp: React.FC = () => {
  const { data, isInitialized, logout } = useFinance();

  const [authView, setAuthView] = useState<
    "login" | "signup" | "forgot-password" | "reset-password" | "verify-email"
  >("login");

  const [verificationEmail, setVerificationEmail] = useState("");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("lang", getLanguage());

    if (
      window.location.pathname === "/auth/reset-password" ||
      window.location.hash.includes("type=recovery")
    ) {
      setAuthView("reset-password");
    }
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  /* ------------------------------------------------------------------ */
  /* AUTH LAYER                                                         */
  /* ------------------------------------------------------------------ */
  if (!data.user) {
    switch (authView) {
      case "signup":
        return (
          <SignUpPage
            onNavigate={(page, email) => {
              if (page === "login") setAuthView("login");
              if (page === "verify-email" && email) {
                setVerificationEmail(email);
                setAuthView("verify-email");
              }
            }}
          />
        );

      case "forgot-password":
        return <ForgotPasswordPage onBack={() => setAuthView("login")} />;

      case "reset-password":
        return <ResetPasswordPage onSuccess={() => setAuthView("login")} />;

      case "verify-email":
        return (
          <EmailVerificationScreen
            email={verificationEmail}
            onLogout={() => {
              setVerificationEmail("");
              setAuthView("login");
            }}
          />
        );

      case "login":
      default:
        return (
          <LoginPage
            onNavigate={(page) => {
              if (page === "signup") setAuthView("signup");
              if (page === "forgot-password")
                setAuthView("forgot-password");
            }}
          />
        );
    }
  }

  /* ------------------------------------------------------------------ */
  /* EMAIL VERIFICATION LAYER                                           */
  /* ------------------------------------------------------------------ */
  if (data.user && data.isEmailVerified === false) {
    return (
      <EmailVerificationScreen
        email={data.user.email}
        onLogout={logout}
      />
    );
  }

  /* ------------------------------------------------------------------ */
  /* HOUSEHOLD ONBOARDING                                               */
  /* ------------------------------------------------------------------ */
  if (!data.household) {
    return <HouseholdSetup />;
  }

  /* ------------------------------------------------------------------ */
  /* APP LAYER                                                          */
  /* ------------------------------------------------------------------ */
  const getHeaderInfo = () => {
    if (currentTab === "forecast") {
      return { title: "", subtitle: null };
    }

    if (currentTab === "dashboard") {
      const dateStr = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return {
        title: `${data.household?.name || "Household"} Dashboard`,
        subtitle: (
          <div className="flex items-center gap-2 font-medium uppercase tracking-wide">
            <Calendar size={14} />
            {dateStr}
          </div>
        ),
      };
    }

    if (currentTab === "goals") {
      return {
        title: "Goals",
        subtitle: "Track your progress towards life events.",
        action: (
          <Button
            onClick={() => setIsGoalDialogOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus size={16} /> New
          </Button>
        ),
      };
    }

    if (currentTab === "settings") {
      return {
        title: "Settings",
        subtitle: "Preferences for your companion.",
      };
    }

    return { title: "", subtitle: null };
  };

  const { title, subtitle, action } = getHeaderInfo();

  const renderView = () => {
    switch (currentTab) {
      case "dashboard":
        return <HomeDashboard onNavigate={setCurrentTab} />;
      case "forecast":
        return (
          <InvestmentForecastView
            onBack={() => setCurrentTab("dashboard")}
          />
        );
      case "fire":
        return <FIREView onBack={() => setCurrentTab("dashboard")} />;
      case "personal":
        return <PersonalDashboard onNavigate={setCurrentTab} />;
      case "me/income":
        return <IncomePage onNavigate={setCurrentTab} />;
      case "me/accounts":
        return <AccountsPage onNavigate={setCurrentTab} />;
      case "me/debts":
        return <DebtsPage onNavigate={setCurrentTab} />;
      case "me/fixed-costs":
        return <FixedCostsPage onNavigate={setCurrentTab} />;
      case "feasibility":
        return <FeasibilityEngine />;
      case "goals":
        return (
          <GoalsView
            isAddOpen={isGoalDialogOpen}
            onOpenChange={setIsGoalDialogOpen}
          />
        );
      case "settings":
        return <SettingsView onNavigate={setCurrentTab} />;
      case "household-management":
        return (
          <HouseholdManagement
            onBack={() => setCurrentTab("settings")}
          />
        );
      default:
        return <HomeDashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      title={title}
      subtitle={subtitle}
      headerAction={action}
    >
      <div className="animate-in fade-in duration-500">
        {renderView()}
      </div>
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
          <Toaster position="top-center" />
        </LanguageProvider>
      </FinanceProvider>
    </ErrorBoundary>
  );
}
