import { showRowImportToasts } from "@/features/backup-export/utils/import-summary";
import {
  IMPORT_EMPTY_SHEET,
  importBlogsFromFile,
} from "@/features/backup-export/utils/import-workbook";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useImportBlog() {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, blogId }: { file: File; blogId: string | number }) =>
      importBlogsFromFile(file, blogId),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_QUERY_KEY });
      showRowImportToasts(result, t);
    },
    onError: (e: Error) => {
      if (e.message === IMPORT_EMPTY_SHEET) {
        toast.error(t("import_empty_sheet"));
        return;
      }
      toast.error(getHttpErrorMessage(e, { default: t("import_bulk_error") }));
    },
  });
}
