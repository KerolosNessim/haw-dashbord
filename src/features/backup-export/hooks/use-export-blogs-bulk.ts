import {
  buildAllBlogsSheets,
  exportBlogsByIds,
} from "@/features/backup-export/services/content-backup-service";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { downloadWorkbook, workbookFromSheets } from "@/lib/excel-io";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function downloadBlogWorkbook(
  sheets: Awaited<ReturnType<typeof exportBlogsByIds>>,
  filename: string,
) {
  const wb = workbookFromSheets(sheets);
  downloadWorkbook(wb, filename);
}

export function useExportBlogsBulk() {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });

  const exportSelected = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      if (!ids.length) throw new Error(t("export_none_selected"));
      const sheets = await exportBlogsByIds(ids);
      const stamp = new Date().toISOString().slice(0, 10);
      const suffix = ids.length === 1 ? `-${ids[0]}` : `-${ids.length}-items`;
      downloadBlogWorkbook(sheets, `howeyah-blogs${suffix}-${stamp}.xlsx`);
    },
    onSuccess: (_data, ids) =>
      toast.success(t("export_bulk_success", { count: ids.length })),
    onError: (e: Error) =>
      toast.error(getHttpErrorMessage(e, { default: t("export_bulk_error") })),
  });

  const exportAll = useMutation({
    mutationFn: async () => {
      const sheets = await buildAllBlogsSheets();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlogWorkbook(sheets, `howeyah-blogs-all-${stamp}.xlsx`);
    },
    onSuccess: () => toast.success(t("export_all_success")),
    onError: (e: Error) =>
      toast.error(getHttpErrorMessage(e, { default: t("export_bulk_error") })),
  });

  return {
    exportSelected,
    exportAll,
    isExporting: exportSelected.isPending || exportAll.isPending,
  };
}
