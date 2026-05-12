import { deletePackageCategory } from "@/features/package-categories/services/package-categories-api";
import { PACKAGE_CATEGORIES_QUERY_KEY } from "@/features/package-categories/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeletePackageCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "package_categories.api" });

  const { mutateAsync: deleteMutation, isPending } = useMutation({
    mutationFn: (id: string) => deletePackageCategory(id),
    onSuccess: () => {
      toast.success(t("delete_success"));
      void queryClient.invalidateQueries({ queryKey: PACKAGE_CATEGORIES_QUERY_KEY });
    },
    onError: (error: Error | AxiosError<unknown>) => {
      const msg =
        axios.isAxiosError(error) && error.response
          ? axiosResponseErrorSummary(error.response?.data)
          : error.message;
      toast.error(msg || t("delete_error"));
    },
  });

  return { deleteMutation, isPending };
}
