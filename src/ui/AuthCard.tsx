// src/ui/AuthCard.tsx
import React from "react";
import { cn } from "./utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "w-full sm:max-w-[420px]",
        "bg-card border border-border rounded-2xl shadow-elevated",
        "p-4 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
};
