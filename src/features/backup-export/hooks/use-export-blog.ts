import { exportBlogsByIds } from "@/features/backup-export/services/content-backup-service";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { downloadWorkbook, workbookFromSheets } from "@/lib/excel-io";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useExportBlog() {
  const { t } = useTranslation("translation", { keyPrefix: "backup_export" });

  return useMutation({
    mutationFn: async (blogId: string | number) => {
      const sheets = await exportBlogsByIds([blogId]);
      const wb = workbookFromSheets(sheets);
      downloadWorkbook(wb, `howeyah-blog-${blogId}.xlsx`);
    },
    onSuccess: () => toast.success(t("export_success")),
    onError: (e: Error) => toast.error(getHttpErrorMessage(e, { default: t("export_error") })),
  });
}
