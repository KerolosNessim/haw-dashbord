import { deleteBlogCategoriesBulk } from "@/features/blog-categories/services/blog-categories-api";
import {
  BLOG_CATEGORIES_PAGED_QUERY_KEY,
  BLOG_CATEGORIES_QUERY_KEY,
} from "@/features/blog-categories/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeleteBlogCategoriesBulk() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "blog_categories.api" });

  const { mutateAsync: deleteCategoriesBulkMutation, isPending } = useMutation({
    mutationFn: (ids: string[]) => deleteBlogCategoriesBulk(ids),
    onSuccess: (data) => {
      toast.success(resolveApiToastMessage(data, t("bulk_delete_success")));
      void queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_PAGED_QUERY_KEY });
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("bulk_delete_error"));
    },
  });

  return { deleteCategoriesBulkMutation, isPending };
}
