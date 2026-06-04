import { updateBlog } from "@/features/blogs/services/blogs-api";
import type { BlogFormValues } from "@/features/blogs/blog-form-schema";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useUpdateBlog(blogId: string | number) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "blogs.api" });

  const { mutateAsync: updateBlogMutation, isPending } = useMutation({
    mutationFn: ({ values, imageFile }: { values: BlogFormValues; imageFile: File | null }) =>
      updateBlog(blogId, values, imageFile),
    onSuccess: (data) => {
      toast.success(resolveApiToastMessage(data, t("update_success")));
      void queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_QUERY_KEY });
      navigate("/blogs");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const summary = axiosResponseErrorSummary(error.response?.data);
        if (summary?.trim()) {
          toast.error(summary);
          return;
        }
      }
      toast.error(t("update_error"));
    },
  });

  return { updateBlogMutation, isPending };
}
