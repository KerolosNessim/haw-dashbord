import { showRowImportToasts } from "@/features/backup-export/utils/import-summary";
import {
  IMPORT_EMPTY_SHEET,
  importServicesFromFile,
} from "@/features/backup-export/utils/import-workbook";
import { getHttpErrorMessage } from "@/lib/http-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useImportServicesBulk() {
  const { t } = useTranslation("translation", { keyPrefix: "services" });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importServicesFromFile,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["services"] });
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
