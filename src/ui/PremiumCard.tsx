import React from "react";
import { cn } from "./utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
  hoverEffect?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  glass = false,
  glow = false,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        /* -------------------------------------------------
         * WIDTH AUTHORITY (CRITICAL)
         * ------------------------------------------------- */
        // Block-level so it participates in normal layout
        "block",
        // Fill available width but never exceed 420px
        "max-w-none sm:max-w-[420px]",
        // Center horizontally when space allows
        "mx-auto",
        // Prevent flex/grid min-content collapse
        "min-w-0",

        /* -------------------------------------------------
         * BASE CARD STYLES
         * ------------------------------------------------- */
        "relative overflow-hidden rounded-2xl border",
        "p-6 transition-all duration-300",
        "bg-card text-card-foreground border-border shadow-elevated",

        /* -------------------------------------------------
         * VISUAL MODIFIERS
         * ------------------------------------------------- */
        glass &&
          "backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/20 supports-[backdrop-filter]:bg-white/40",

        glow &&
          "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-primary/5",

        hoverEffect &&
          "hover:shadow-elevated-strong hover:-translate-y-1 hover:border-primary/20",

        className
      )}
    >
      {children}
    </div>
  );
};
