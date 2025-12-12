import React from "react";
import { PremiumCard } from "./PremiumCard";
import { cn } from "./utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AuthCard: shared wrapper for auth screens.
 * Uses PremiumCard in fullWidth mode with consistent padding.
 */
export const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <PremiumCard
      glow
      
      className={cn(
        "p-6 md:p-8 rounded-xl shadow-md bg-card",
        className
      )}
    >
      {children}
    </PremiumCard>
  );
};
