import { createPackage, updatePackage } from "@/features/packages/services/packages-api";
import type { PackageFormValues } from "@/features/packages/types";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
export function useSavePackage(mode: "create" | "edit", packageId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "packages.api" });
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: ({
      values,
      iconFile,
    }: {
      values: PackageFormValues;
      iconFile: File | null;
    }) =>
      mode === "create"
        ? createPackage(values, iconFile)
        : updatePackage(packageId as string, values, iconFile),
    onSuccess: (data) => {
      const fallback = mode === "create" ? t("create_success") : t("update_success");
      toast.success(resolveApiToastMessage(data, fallback));
      void queryClient.invalidateQueries({ queryKey: [...PACKAGES_QUERY_KEY, locale] });
      void queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
      navigate("/packages");
    },
    onError: (error: Error | AxiosError<unknown>) => {
      const fromAxios =
        axios.isAxiosError(error) && error.response
          ? axiosResponseErrorSummary(error.response?.data)
          : undefined;
      toast.error(fromAxios?.trim() || t("save_error"));
    },
  });

  return { saveMutation, isPending };
}
