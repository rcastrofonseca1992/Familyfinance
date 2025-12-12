// src/components/auth/SignUpPage.tsx
import React, { useState } from "react";

import { AuthLayout } from "./AuthLayout";
import { AuthHeader } from "./AuthHeader";
import { AuthCard } from "../../ui/AuthCard";
import { AuthTextInput } from "../../ui/AuthTextInput";
import { AuthPasswordInput } from "../../ui/AuthPasswordInput";
import { Button } from "../../ui/button";

import { useLanguage } from "../../contexts/LanguageContext";
import { ArrowRight, Loader2 } from "lucide-react";

interface SignUpPageProps {
  onNavigate: (page: "login" | "dashboard") => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.trim().length >= 6;
  const formValid = name.trim().length > 0 && emailValid && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      // signup logic goes here
      await new Promise((r) => setTimeout(r, 800));
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err?.message || t("signup.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      language={language}
      onLanguageChange={setLanguage}
      pageLabel="Sign up"
      showBackButton
      onBack={() => onNavigate("login")}
    >
      <AuthHeader
        title={t("signup.title")}
        subtitle={t("signup.subtitle")}
      />

      <AuthCard>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <AuthTextInput
            id="name"
            label={t("signup.name")}
            placeholder={t("signup.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon="user"
          />

          <AuthTextInput
            id="email"
            label={t("signup.email")}
            placeholder={t("signup.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="mail"
            error={
              !emailValid && email.length > 0
                ? t("signup.emailInvalid")
                : null
            }
          />

          <AuthPasswordInput
            id="password"
            label={t("signup.password")}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={
              !passwordValid && password.length > 0
                ? t("signup.passwordTooShort")
                : null
            }
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !formValid}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("signup.button")}…
              </>
            ) : (
              <>
                {t("signup.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 text-center text-sm text-muted-foreground space-y-3">
          <p>{t("signup.haveAccount")}</p>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => onNavigate("login")}
          >
            {t("signup.login")}
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};
