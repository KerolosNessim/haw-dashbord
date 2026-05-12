import {
  createPackageCategory,
  updatePackageCategory,
} from "@/features/package-categories/services/package-categories-api";
import type { PackageCategoryFormValues } from "@/features/package-categories/types";
import {
  PACKAGE_CATEGORIES_PAGED_QUERY_KEY,
  PACKAGE_CATEGORIES_QUERY_KEY,
} from "@/features/package-categories/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
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
      const fallback = mode === "create" ? t("create_success") : t("update_success");
      toast.success(resolveApiToastMessage(data, fallback));
      void queryClient.invalidateQueries({ queryKey: PACKAGE_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: PACKAGE_CATEGORIES_PAGED_QUERY_KEY });
      navigate("/package-categories");
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
