// src/ui/AuthHeader.tsx
import React from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="mb-8 text-center space-y-4">
      <div className="text-3xl font-extrabold tracking-tight flex items-baseline justify-center gap-1">
        <span className="text-primary">Noti</span>
        <span className="text-[rgb(251,191,36)]">now</span>
      </div>

      <h1 className="text-xl font-semibold">{title}</h1>

      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {subtitle}
      </p>
    </header>
  );
};
