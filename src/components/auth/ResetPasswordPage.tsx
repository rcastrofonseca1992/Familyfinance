import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PremiumCard } from "../../ui/PremiumCard";

import {
  Lock,
  CheckCircle,
  Loader2,
  KeyRound,
} from "lucide-react";

import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "motion/react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

import { AuthLayout } from "./AuthLayout";
import { AuthHeader } from "./AuthHeader";

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onSuccess,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  // Ensure Supabase created a reset session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);

      if (!session) {
        setError(
          t("resetPassword.noSession") ||
            "No active password reset session. Request a new email."
        );
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 6) {
      setError(t("resetPassword.passwordTooShort") || "Password is too short.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        t("resetPassword.passwordMismatch") || "Passwords do not match."
      );
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(
        err.message ||
          t("resetPassword.error") ||
          "Failed to reset password."
      );
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
      showBackButton
      onBack={onSuccess}
      pageLabel={t("resetPassword.pageLabel")}
    >
      <AuthHeader
        title={t("resetPassword.title")}
        subtitle={t("resetPassword.subtitle")}
      />

      {/* REQUIRED WRAPPER FOR CORRECT WIDTH */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-auto mx-auto flex justify-center"
      >
        <PremiumCard
          glow
          className="w-full max-w-[360px] p-6 md:p-8 space-y-6 shadow-md"
        >
          {/* NO VALID SESSION */}
          {!hasSession && !success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-md 
              text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* SUCCESS */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h3 className="font-semibold text-lg">
                {t("resetPassword.success")}
              </h3>

              <p className="text-muted-foreground text-sm">
                {t("resetPassword.redirecting")}
              </p>
            </motion.div>
          ) : (
            hasSession && (
              <>
                {/* INPUT ERRORS */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-md 
                    text-red-600 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">

                  {/* NEW PASSWORD */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t("resetPassword.newPassword")}</Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        id="new-password"
                        type="password"
                        required
                        minLength={6}
                        placeholder={t("resetPassword.newPasswordPlaceholder")}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("resetPassword.confirmPassword")}</Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        minLength={6}
                        placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* SAVE BUTTON */}
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("resetPassword.updating")}…
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        {t("resetPassword.button")}
                      </>
                    )}
                  </Button>
                </form>
              </>
            )
          )}
        </PremiumCard>
      </motion.div>
    </AuthLayout>
  );
};
