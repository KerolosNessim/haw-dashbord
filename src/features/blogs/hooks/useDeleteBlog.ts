import { deleteBlog } from "@/features/blogs/services/blogs-api";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "blogs.api" });

  const { mutateAsync: deleteBlogMutation, isPending } = useMutation({
    mutationFn: (blogId: string | number) => deleteBlog(blogId),
    onSuccess: () => {
      toast.success(t("delete_success"));
      void queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_QUERY_KEY });
    },
    onError: (error: AxiosError<unknown>) => {
      const summary = axiosResponseErrorSummary(error.response?.data);
      toast.error(summary || t("delete_error"));
    },
  });

  return { deleteBlogMutation, isPending };
}
