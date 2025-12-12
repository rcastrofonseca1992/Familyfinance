// ui/AuthTextInput.tsx
import React from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Mail, User } from "lucide-react";

const icons = {
  mail: Mail,
  user: User,
};

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: keyof typeof icons;
  error?: string | null;
}

export const AuthTextInput = ({ label, icon, error, ...props }: Props) => {
  const Icon = icon ? icons[icon] : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        )}

        <Input
          {...props}
          className={`
            ${icon ? "pl-9" : ""}
            bg-card/70 hover:bg-card/90 focus:bg-card
            border border-border/50 rounded-lg
            transition-colors
          `}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};
