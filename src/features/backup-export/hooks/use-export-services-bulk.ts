import { exportServicesByIds } from "@/features/backup-export/services/service-backup-service";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { downloadWorkbook, workbookFromSheets } from "@/lib/excel-io";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useExportServicesBulk() {
  const { t } = useTranslation("translation", { keyPrefix: "services" });

  return useMutation({
    mutationFn: async (ids: (number | string)[]) => {
      if (!ids.length) throw new Error(t("export_none_selected"));
      const sheets = await exportServicesByIds(ids);
      const wb = workbookFromSheets(sheets);
      const stamp = new Date().toISOString().slice(0, 10);
      const suffix = ids.length === 1 ? `-${ids[0]}` : `-${ids.length}-items`;
      downloadWorkbook(wb, `howeyah-services${suffix}-${stamp}.xlsx`);
    },
    onSuccess: (_data, ids) =>
      toast.success(t("export_bulk_success", { count: ids.length })),
    onError: (e: Error) =>
      toast.error(getHttpErrorMessage(e, { default: t("export_bulk_error") })),
  });
}
