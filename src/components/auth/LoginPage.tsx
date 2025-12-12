// components/auth/LoginPage.tsx
import React, { useEffect, useState } from "react";

import {
  getLastUser,
  clearLastUser,
  saveLastUser,
} from "../../utils/authDeviceStorage";
import { maskEmail } from "../../utils/maskEmail";

import { Button } from "../../ui/button";
import { AuthCard } from "../../ui/AuthCard";
import { AuthHeader } from "../../ui/AuthHeader";
import { AuthTextInput } from "../../ui/AuthTextInput";
import { AuthPasswordInput } from "../../ui/AuthPasswordInput";

import { useFinance } from "../../store/FinanceContext";
import { useLanguage } from "../../contexts/LanguageContext";

import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";

import { AuthLayout } from "./AuthLayout";

interface LoginPageProps {
  onNavigate: (page: "signup" | "dashboard" | "forgot-password") => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  // --------------------------------------------------
  // HYDRATION FIX
  // --------------------------------------------------
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // --------------------------------------------------
  // HOOKS
  // --------------------------------------------------
  const { login } = useFinance();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"returning" | "form">("form");

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.trim().length >= 6;
  const formValid = emailValid && passwordValid;

  // --------------------------------------------------
  // LANGUAGE HANDLER
  // --------------------------------------------------
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("pendingLanguage", lang);
  };

  // --------------------------------------------------
  // LOAD RETURNING USER
  // --------------------------------------------------
  useEffect(() => {
    const last = getLastUser();
    if (last?.email) {
      setSavedEmail(last.email);
      setViewMode("returning");
    }
  }, []);

  // --------------------------------------------------
  // LOGIN PROCESS
  // --------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || loading) return;

    setLoading(true);
    setAuthError(null);

    try {
      await login(email.trim(), password.trim());
      saveLastUser(email.trim());
    } catch (err: any) {
      setAuthError(err?.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (savedEmail) setEmail(savedEmail);
    setViewMode("form");
  };

  const handleNotYou = () => {
    clearLastUser();
    setSavedEmail(null);
    setViewMode("form");
  };

  // --------------------------------------------------
  // HYDRATION GUARD
  // --------------------------------------------------
  if (!hydrated) return null;

  const isReturning = viewMode === "returning" && !!savedEmail;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <AuthLayout
      language={language}
      onLanguageChange={handleLanguageChange}
      pageLabel="Login Page"
    >
      {/* -------------------------------------------------- */}
      {/* RETURNING USER EXPERIENCE */}
      {/* -------------------------------------------------- */}
      {isReturning ? (
        <>
          <AuthHeader
            title={t("login.welcomeBack")}
            subtitle={t("login.lastSignedInAs") + " " + maskEmail(savedEmail!)}
          />

          <AuthCard>
            <div className="space-y-4">
              <Button className="w-full" size="lg" onClick={handleContinue}>
                {t("login.continue")}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleNotYou}
              >
                {t("login.notYou")}
              </Button>
            </div>
          </AuthCard>
        </>
      ) : (
        <>
          {/* -------------------------------------------------- */}
          {/* STANDARD LOGIN FORM */}
          {/* -------------------------------------------------- */}
          <AuthHeader title={t("login.title")} subtitle={t("login.subtitle")} />

          <AuthCard>
            {/* AUTH ERROR */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-600 text-sm"
              >
                {authError}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              <AuthTextInput
                id="email"
                label={t("login.email")}
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="mail"
                error={
                  !emailValid && email.length > 0
                    ? t("login.emailInvalid")
                    : null
                }
              />

              <AuthPasswordInput
                id="password"
                label={t("login.password")}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={
                  !passwordValid && password.length > 0
                    ? t("login.passwordTooShort")
                    : null
                }
              />

              {/* FORGOT PASSWORD */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onNavigate("forgot-password")}
                  className="text-xs text-primary hover:underline"
                >
                  {t("login.forgotPassword")}
                </button>
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !formValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("login.button")}…
                  </>
                ) : (
                  <>
                    {t("login.button")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* SIGN UP CTA */}
            <div className="pt-4 text-center text-sm text-muted-foreground space-y-3">
              <p>{t("login.noAccount")}</p>

              <Button
                onClick={() => onNavigate("signup")}
                variant="outline"
                size="lg"
                className="w-full text-primary border-primary/40 hover:bg-primary/5"
              >
                {t("login.signUp")}
              </Button>
            </div>
          </AuthCard>
        </>
      )}
    </AuthLayout>
  );
};
