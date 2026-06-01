import { deleteBlog } from "@/features/blogs/services/blogs-api";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import type { DeleteSlugRedirectPayload } from "@/lib/delete-slug-redirect";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export type DeleteBlogVariables = {
  blogId: string | number;
  redirect: DeleteSlugRedirectPayload;
};

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "blogs.api" });

  const { mutateAsync: deleteBlogMutation, isPending } = useMutation({
    mutationFn: ({ blogId, redirect }: DeleteBlogVariables) => deleteBlog(blogId, redirect),
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
