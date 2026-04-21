import { useTranslation } from "react-i18next";
import { LoginForm } from "@/features/auth/components/login-form";

export function Login() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <img src="/logo.png" alt="logo" className="w-24 h-24 mx-auto object-contain" />
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-sm text-center">
          {t("login_subtitle")}
        </p>
      </div>

           <LoginForm />
    </div>
  );
}

