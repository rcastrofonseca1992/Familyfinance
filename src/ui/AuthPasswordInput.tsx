// ui/AuthPasswordInput.tsx
import React, { useState } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Lock, Eye, EyeOff } from "lucide-react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const AuthPasswordInput = ({ label, error, ...props }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>

      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          {...props}
          type={visible ? "text" : "password"}
          className="
            pl-9 pr-10
            bg-card/70 hover:bg-card/90 focus:bg-card
            border border-border/50 rounded-lg
            transition-colors
          "
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
