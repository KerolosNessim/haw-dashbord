import {
  createServiceCatalog,
  extractCreatedIdFromResponse,
  updateServiceCatalog,
} from "@/features/service-catalog/services/service-catalog-api";
import { SERVICE_CATALOG_QUERY_KEY } from "@/features/service-catalog/query-keys";
import type { ServiceCatalogFormValues } from "@/features/service-catalog/types";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSaveServiceCatalog(mode: "create" | "edit", itemId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "service_catalog.api" });

  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: ({
      values,
      imageFile,
    }: {
      values: ServiceCatalogFormValues;
      imageFile: File | null;
    }) =>
      mode === "create"
        ? createServiceCatalog(values, imageFile)
        : updateServiceCatalog(itemId as string, values, imageFile),
    onSuccess: (data) => {
      const fallback = mode === "create" ? t("create_success") : t("update_success");
      toast.success(resolveApiToastMessage(data, fallback));
      void queryClient.invalidateQueries({ queryKey: SERVICE_CATALOG_QUERY_KEY });

      if (mode === "create") {
        const newId = extractCreatedIdFromResponse(data);
        if (newId) navigate(`/service-catalog/edit/${newId}`);
        else navigate("/service-catalog");
        return;
      }
      navigate("/service-catalog");
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("save_error"));
    },
  });

  return { saveMutation, isPending };
}
