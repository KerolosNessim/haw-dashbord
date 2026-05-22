import { exportServiceById } from "@/features/backup-export/services/service-backup-service";
import { downloadWorkbook, workbookFromSheets } from "@/lib/excel-io";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useExportService() {
  const { t } = useTranslation("translation", { keyPrefix: "backup_export" });

  return useMutation({
    mutationFn: async (serviceId: number | string) => {
      const sheets = await exportServiceById(serviceId);
      const wb = workbookFromSheets(sheets);
      downloadWorkbook(wb, `howeyah-service-${serviceId}.xlsx`);
    },
    onSuccess: () => toast.success(t("export_success")),
    onError: (e: Error) => toast.error(e.message || t("export_error")),
  });
}
