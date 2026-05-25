import { deleteServiceCatalog } from "@/features/service-catalog/services/service-catalog-api";
import { SERVICE_CATALOG_QUERY_KEY } from "@/features/service-catalog/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeleteServiceCatalog() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "service_catalog.api" });

  const { mutateAsync: deleteMutation, isPending } = useMutation({
    mutationFn: (id: string) => deleteServiceCatalog(id),
    onSuccess: (data) => {
      toast.success(resolveApiToastMessage(data, t("delete_success")));
      void queryClient.invalidateQueries({ queryKey: SERVICE_CATALOG_QUERY_KEY });
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("delete_error"));
    },
  });

  return { deleteMutation, isPending };
}
