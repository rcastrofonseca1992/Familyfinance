import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base layout
        "flex h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-base md:text-sm",
        
        // Background + hover + focus to match SignUpPage
        "bg-card/70 hover:bg-card/90 focus:bg-card transition-colors",

        // Border + focus ring
        "border-border/50 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 outline-none",

        // Placeholder + selection
        "placeholder:text-muted-foreground selection:bg-primary/20",

        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed",

        className
      )}
      {...props}
    />
  );
}

export { Input };
