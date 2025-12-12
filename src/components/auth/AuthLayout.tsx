// src/components/auth/AuthLayout.tsx
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Globe, ArrowLeft } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import { AVAILABLE_LANGUAGES } from "../../utils/i18n";

interface AuthLayoutProps {
  children: React.ReactNode;
  language: string;
  onLanguageChange: (lang: string) => void;
  pageLabel?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  language,
  onLanguageChange,
  pageLabel,
  showBackButton = false,
  onBack,
}) => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsPWA(standalone);
  }, []);

  return (
    <main
      aria-label={pageLabel}
      className="w-full min-h-screen bg-gradient-to-br from-background via-secondary/40 to-background relative"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="fixed left-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-sm"
          style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* CONTENT */}
      <div
        className="w-full min-h-screen flex justify-center px-4"
        style={{
          alignItems: isPWA ? "flex-start" : "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full flex flex-col items-center gap-6 pt-12"
        >
          {children}
        </motion.div>
      </div>

      {/* LANGUAGE SWITCHER — CORRECT CENTERING */}
      <div
        className="
          fixed
          inset-x-0
          flex
          justify-center
          z-50
        "
        style={{
          bottom: "calc(1rem + env(safe-area-inset-bottom))",
        }}
      >
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[180px] bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
            <Globe className="mr-2 h-4 w-4 text-primary" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="center">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </main>
  );
};
