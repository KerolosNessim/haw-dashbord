import { deleteCourse } from "@/features/courses/services/courses-api";
import { COURSES_QUERY_KEY } from "@/features/courses/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "courses.api" });
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

  const { mutateAsync: deleteMutation, isPending } = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      toast.success(t("delete_success"));
      void queryClient.invalidateQueries({ queryKey: [...COURSES_QUERY_KEY, locale] });
      void queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("delete_error"));
    },
  });

  return { deleteMutation, isPending };
}
