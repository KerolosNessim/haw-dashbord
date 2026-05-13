import {
  createCourse,
  extractCreatedIdFromCourseResponse,
  updateCourse,
} from "@/features/courses/services/courses-api";
import type { CourseFormValues } from "@/features/courses/types";
import { COURSES_QUERY_KEY } from "@/features/courses/query-keys";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { resolveApiToastMessage } from "@/lib/api-toast-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSaveCourse(mode: "create" | "edit", courseId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "courses.api" });
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: ({ values, imageFile }: { values: CourseFormValues; imageFile: File | null }) =>
      mode === "create" ? createCourse(values, imageFile) : updateCourse(courseId as string, values, imageFile),
    onSuccess: (data) => {
      const fallback = mode === "create" ? t("create_success") : t("update_success");
      toast.success(resolveApiToastMessage(data, fallback));
      void queryClient.invalidateQueries({ queryKey: [...COURSES_QUERY_KEY, locale] });
      void queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });

      if (mode === "create") {
        const newId = extractCreatedIdFromCourseResponse(data);
        if (newId) navigate(`/courses/edit/${newId}`);
        else navigate("/courses");
        return;
      }
      navigate("/courses");
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("save_error"));
    },
  });

  return { saveMutation, isPending };
}
