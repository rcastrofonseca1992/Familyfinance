// src/components/auth/LoginPage.tsx
import React from "react";
import { Button } from "../../ui/button";
import { AuthLayout } from "./AuthLayout";
import { AuthHeader } from "./AuthHeader";
import { AuthCard } from "../../ui/AuthCard";
import { AuthTextInput } from "../../ui/AuthTextInput";
import { AuthPasswordInput } from "../../ui/AuthPasswordInput";
import { useLanguage } from "../../contexts/LanguageContext";

export const LoginPage = ({ onNavigate }: any) => {
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("FORM SUBMITTED");
    onNavigate("household-setup");
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          <AuthTextInput
            id="email"
            label={t("login.email")}
            placeholder="email@example.com"
            icon="mail"
          />

          <AuthPasswordInput
            id="password"
            label={t("login.password")}
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

          <Button
            type="submit"
            className="w-full"
            size="lg"
          >
            {t("login.button")}
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
