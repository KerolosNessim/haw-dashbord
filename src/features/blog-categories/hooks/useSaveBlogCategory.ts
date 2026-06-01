import {
  createBlogCategory,
  updateBlogCategory,
} from "@/features/blog-categories/services/blog-categories-api";
import type { BlogCategoryFormValues } from "@/features/blog-categories/types";
import {
  BLOG_CATEGORIES_PAGED_QUERY_KEY,
  BLOG_CATEGORIES_QUERY_KEY,
} from "@/features/blog-categories/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSaveBlogCategory(mode: "create" | "edit", categoryId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t: tRoot } = useTranslation();
  const { t } = useTranslation("translation", { keyPrefix: "blog_categories.api" });

  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: (values: BlogCategoryFormValues) =>
      mode === "create"
        ? createBlogCategory(values)
        : updateBlogCategory(categoryId as string, values),
    onSuccess: (data) => {
      const fallback = mode === "create" ? t("create_success") : t("update_success");
      toast.success(resolveApiToastMessage(data, fallback, tRoot));
      void queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_PAGED_QUERY_KEY });
      navigate("/blog-categories");
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("save_error"));
    },
  });

  return { saveMutation, isPending };
}
