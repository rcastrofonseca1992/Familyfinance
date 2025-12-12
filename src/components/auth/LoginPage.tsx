// src/components/auth/LoginPage.tsx
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { AuthLayout } from "./AuthLayout";
import { AuthHeader } from "./AuthHeader";
import { AuthCard } from "../../ui/AuthCard";
import { AuthTextInput } from "../../ui/AuthTextInput";
import { AuthPasswordInput } from "../../ui/AuthPasswordInput";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFinance } from "../../store/FinanceContext";
import { Loader2 } from "lucide-react";

export const LoginPage = ({ onNavigate }: any) => {
  const { language, setLanguage, t } = useLanguage();
  const { login } = useFinance();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.trim().length >= 6;
  const formValid = emailValid && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!formValid) {
      if (!emailValid) setError(t("login.emailInvalid"));
      else if (!passwordValid) setError(t("login.passwordTooShort"));
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      language={language}
      onLanguageChange={setLanguage}
      pageLabel="Login"
    >
      <AuthHeader
        title={t("login.title")}
        subtitle={t("login.subtitle")}
      />

      <AuthCard>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <AuthTextInput
            id="email"
            label={t("login.email")}
            placeholder="email@example.com"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!emailValid && email.length > 0 ? t("login.emailInvalid") : null}
          />

          <AuthPasswordInput
            id="password"
            label={t("login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!passwordValid && password.length > 0 ? t("login.passwordTooShort") : null}
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate("forgot-password")}
              className="text-xs text-primary hover:underline"
            >
              {t("login.forgotPassword")}
            </button>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("login.button")}
              </>
            ) : (
              t("login.button")
            )}
          </Button>
        </form>

        <div className="pt-4 text-center text-sm text-muted-foreground space-y-3">
          <p>{t("login.noAccount")}</p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => onNavigate("signup")}
          >
            {t("login.signUp")}
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};
