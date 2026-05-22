import BackupExportPanel from "@/features/backup-export/components/backup-export-panel";
import { Link } from "react-router-dom";
import { ArrowLeft, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function BackupExportPage() {
  const { t } = useTranslation("translation", { keyPrefix: "backup_export" });

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-4 text-4xl font-black tracking-tight text-gray-900">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Database className="size-7 text-primary" />
            </span>
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg font-medium text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold" asChild>
          <Link to="/settings">
            <ArrowLeft className="mr-2 size-4" />
            {t("back_settings")}
          </Link>
        </Button>
      </div>

      <BackupExportPanel />
    </div>
  );
}
