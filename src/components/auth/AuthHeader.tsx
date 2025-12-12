// src/components/auth/AuthHeader.tsx
import React from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="w-full text-center space-y-4 max-w-none">
      <div className="text-3xl font-extrabold tracking-tight">
      <span className="font-bold text-primary">Noti</span>
<span
  className="font-bold"
  style={{ color: "rgb(251, 191, 36)" }}
>
  now
</span>

      </div>

      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
};
