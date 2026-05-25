"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn("pe-11", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute end-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? t("hide_password") : t("show_password")}
        aria-pressed={showPassword}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </Button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
