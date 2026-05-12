import {
  createCourseSection,
  deleteCourseSection,
  updateCourseSection,
} from "@/features/courses/services/courses-api";
import { courseSectionsKey } from "@/features/courses/query-keys";
import type { CourseSectionFormValues } from "@/features/courses/types";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useMutateCourseSection(courseId: string | undefined) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("translation", { keyPrefix: "courses.sections_api" });
  const numericId = courseId ? Number.parseInt(courseId, 10) : NaN;
  const cid = Number.isFinite(numericId) ? numericId : NaN;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [...courseSectionsKey(courseId)] });
  };

  const { mutateAsync: createSection, isPending: isCreating } = useMutation({
    mutationFn: (values: CourseSectionFormValues) => {
      if (!Number.isFinite(cid)) throw new Error("course id");
      return createCourseSection(cid, values);
    },
    onSuccess: () => {
      toast.success(t("create_success"));
      invalidate();
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("save_error"));
    },
  });

  const { mutateAsync: updateSection, isPending: isUpdating } = useMutation({
    mutationFn: ({
      sectionId,
      values,
    }: {
      sectionId: string;
      values: CourseSectionFormValues;
    }) => {
      if (!Number.isFinite(cid)) throw new Error("course id");
      return updateCourseSection(sectionId, cid, values);
    },
    onSuccess: () => {
      toast.success(t("update_success"));
      invalidate();
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("save_error"));
    },
  });

  const { mutateAsync: removeSection, isPending: isDeleting } = useMutation({
    mutationFn: (sectionId: string) => deleteCourseSection(sectionId),
    onSuccess: () => {
      toast.success(t("delete_success"));
      invalidate();
    },
    onError: (error: AxiosError<unknown>) => {
      toast.error(axiosResponseErrorSummary(error.response?.data) || t("delete_error"));
    },
  });

  return {
    createSection,
    updateSection,
    removeSection,
    isPending: isCreating || isUpdating || isDeleting,
  };
}
