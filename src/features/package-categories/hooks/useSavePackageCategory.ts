import {
  createPackageCategory,
  updatePackageCategory,
} from "@/features/package-categories/services/package-categories-api";
import type { PackageCategoryFormValues } from "@/features/package-categories/types";
import { PACKAGE_CATEGORIES_QUERY_KEY } from "@/features/package-categories/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSavePackageCategory(mode: "create" | "edit", categoryId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "package_categories.api" });

  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: (values: PackageCategoryFormValues) =>
      mode === "create"
        ? createPackageCategory(values)
        : updatePackageCategory(categoryId as string, values),
    onSuccess: (data) => {
      const msg =
        typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
          ? data.message
          : mode === "create"
            ? t("create_success")
            : t("update_success");
      toast.success(msg);
      void queryClient.invalidateQueries({ queryKey: PACKAGE_CATEGORIES_QUERY_KEY });
      navigate("/package-categories");
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
