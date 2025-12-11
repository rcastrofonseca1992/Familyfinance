
import React from 'react';
import { cn } from './utils';

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
      className={cn(
        "relative rounded-2xl border p-6 transition-all duration-300 overflow-hidden",
        // Base style
        "bg-card text-card-foreground border-border shadow-elevated",
        // Glassmorphism
        glass && "backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/20 supports-[backdrop-filter]:bg-white/40",
        // Glow effect
        glow && "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-primary/5",
        // Hover effect
        hoverEffect && "hover:shadow-elevated-strong hover:-translate-y-1 hover:border-primary/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
