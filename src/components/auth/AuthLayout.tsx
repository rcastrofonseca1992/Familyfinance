// components/auth/AuthLayout.tsx
import React from "react";
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
  return (
    <main
      aria-label={pageLabel}
      className="
        min-h-screen
        bg-gradient-to-br
        from-background
        via-secondary/40
        to-background
        relative
      "
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="
            fixed left-4 top-4 z-50
            p-3 rounded-full
            bg-card/80 backdrop-blur-md
            border border-border/50 shadow-sm
          "
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div className="fixed right-4 top-4 z-50">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[180px] bg-card/80 backdrop-blur-md border-border/50 shadow-sm">
            <Globe className="mr-2 h-4 w-4 text-primary" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
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

      <div
        className="
          min-h-screen
          w-full
          flex
          flex-col
          items-center
          justify-start
          sm:justify-center
          px-2 sm:px-6
        "
      >
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="
            w-full
            max-w-[420px]
            flex flex-col
            items-stretch
            gap-6
            py-12 sm:py-0
          "
        >
          {children}
        </motion.section>
      </div>
    </main>
  );
};
