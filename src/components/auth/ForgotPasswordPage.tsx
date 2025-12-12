import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PremiumCard } from "../../ui/PremiumCard";

import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "motion/react";

import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { AuthLayout } from "./AuthLayout";
import { AuthHeader } from "./AuthHeader";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBack,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      // For security, always show success regardless
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset password request error:", err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      language={language}
      onLanguageChange={(lang) => {
        setLanguage(lang);
        localStorage.setItem("pendingLanguage", lang);
      }}
      pageLabel={t("forgotPassword.pageLabel")}
      showBackButton
      onBack={onBack}
    >
      <AuthHeader
        title={t("forgotPassword.title")}
        subtitle={t("forgotPassword.subtitle")}
      />

      {/* WRAPPER (required to prevent full-width card) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-auto mx-auto flex justify-center"
      >
        <PremiumCard
          glow
          className="w-full max-w-[360px] p-6 md:p-8 shadow-md space-y-6"
        >
          {/* SUCCESS STATE */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h3 className="font-semibold text-lg">
                {t("forgotPassword.success")}
              </h3>

              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.successMessageGeneric")}
              </p>

              <p className="font-semibold text-primary break-all">{email}</p>

              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.successMessageGeneric2")}
              </p>

              <p className="text-xs text-muted-foreground pt-1">
                {t("forgotPassword.checkSpam")}
              </p>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.backToLogin")}
              </Button>
            </motion.div>
          ) : (
            <>
              {/* ERROR (rare Supabase internal error) */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* FORM */}
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("forgotPassword.email")}</Label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t("forgotPassword.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* SUBMIT */}
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("forgotPassword.sending")}…
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {t("forgotPassword.button")}
                    </>
                  )}
                </Button>
              </form>

              {/* BACK TO LOGIN */}
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onBack}
              >
                {t("common.backToLogin")}
              </Button>
            </>
          )}
        </PremiumCard>
      </motion.div>
    </AuthLayout>
  );
};
