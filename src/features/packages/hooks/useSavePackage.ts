import { createPackage, updatePackage } from "@/features/packages/services/packages-api";
import type { PackageFormValues } from "@/features/packages/types";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
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
      const msg =
        typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
          ? data.message
          : mode === "create"
            ? t("create_success")
            : t("update_success");
      toast.success(msg);
      void queryClient.invalidateQueries({ queryKey: [...PACKAGES_QUERY_KEY, locale] });
      void queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
      navigate("/packages");
    },
    onError: (error: Error | AxiosError<unknown>) => {
      const msg =
        axios.isAxiosError(error) && error.response
          ? axiosResponseErrorSummary(error.response?.data)
          : error.message;
      toast.error(msg || t("save_error"));
    },
  });

  return { saveMutation, isPending };
}
