import { deleteBlogsBulk } from "@/features/blogs/services/blogs-api";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeleteBlogsBulk() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "blogs.api" });

  const { mutateAsync: deleteBlogsBulkMutation, isPending } = useMutation({
    mutationFn: (ids: (string | number)[]) => deleteBlogsBulk(ids),
    onSuccess: () => {
      toast.success(t("bulk_delete_success"));
      void queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_QUERY_KEY });
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("bulk_delete_error"));
    },
  });

  return { deleteBlogsBulkMutation, isPending };
}
