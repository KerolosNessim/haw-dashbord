import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function AccessDeniedPage() {
  const { t } = useTranslation("translation", { keyPrefix: "permissions" });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldX className="h-8 w-8" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("access_denied_title")}</h1>
        <p className="text-muted-foreground">{t("access_denied_description")}</p>
      </div>
      <Button asChild variant="default">
        <Link to="/">{t("back_to_dashboard")}</Link>
      </Button>
    </div>
  );
}
