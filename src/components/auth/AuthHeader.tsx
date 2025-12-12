// ui/AuthHeader.tsx
import React from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="text-center space-y-3">
      <div className="text-3xl font-extrabold tracking-tight flex items-baseline justify-center gap-1">
        <span className="text-primary">Noti</span>
        <span className="text-[rgb(251,191,36)]">now</span>
      </div>

      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {subtitle}
      </p>
    </header>
  );
};
