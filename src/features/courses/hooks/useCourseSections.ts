import {
  fetchCourseSections,
} from "@/features/courses/services/courses-api";
import { courseSectionsKey, COURSES_QUERY_KEY } from "@/features/courses/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useCourseSections(courseId: string | undefined) {
  return useQuery({
    queryKey: courseSectionsKey(courseId),
    queryFn: () => fetchCourseSections(courseId as string),
    enabled: Boolean(courseId),
    staleTime: 15_000,
  });
}
