import { fetchCourseDetailForEdit } from "@/features/courses/services/courses-api";
import { COURSES_QUERY_KEY } from "@/features/courses/query-keys";
import type { CourseDetailForForm } from "@/features/courses/types";
import { useQuery } from "@tanstack/react-query";

export function useCourseDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...COURSES_QUERY_KEY, "one", id],
    queryFn: (): Promise<CourseDetailForForm | null> => fetchCourseDetailForEdit(id as string),
    enabled: Boolean(id),
  });
}
