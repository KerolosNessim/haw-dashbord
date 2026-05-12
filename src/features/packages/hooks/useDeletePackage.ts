import { deletePackage } from "@/features/packages/services/packages-api";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeletePackage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "packages.api" });
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

  const { mutateAsync: deleteMutation, isPending } = useMutation({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      toast.success(t("delete_success"));
      void queryClient.invalidateQueries({ queryKey: [...PACKAGES_QUERY_KEY, locale] });
      void queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
    },
    onError: (error: Error | AxiosError<unknown>) => {
      const fromAxios =
        axios.isAxiosError(error) && error.response
          ? axiosResponseErrorSummary(error.response?.data)
          : undefined;
      toast.error(fromAxios?.trim() || t("delete_error"));
    },
  });

  return { deleteMutation, isPending };
}
