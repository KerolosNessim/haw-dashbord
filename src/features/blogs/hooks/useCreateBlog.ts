import { createBlog } from "@/features/blogs/services/blogs-api";
import type { BlogFormValues } from "@/features/blogs/blog-form-schema";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useCreateBlog() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "blogs.api" });

  const { mutateAsync: createBlogMutation, isPending } = useMutation({
    mutationFn: ({ values, imageFile }: { values: BlogFormValues; imageFile: File | null }) =>
      createBlog(values, imageFile),
    onSuccess: (data) => {
      const msg =
        typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
          ? data.message
          : t("create_success");
      toast.success(msg);
      void queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_QUERY_KEY });
      navigate("/blogs");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const summary = axiosResponseErrorSummary(error.response?.data);
        if (summary) {
          toast.error(summary);
          return;
        }
      }
      if (error instanceof Error && error.message.trim()) {
        toast.error(error.message.trim());
        return;
      }
      toast.error(t("create_error"));
    },
  });

  return { createBlogMutation, isPending };
}
