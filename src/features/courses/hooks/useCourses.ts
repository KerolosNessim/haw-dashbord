import { fetchCourses } from "@/features/courses/services/courses-api";
import { COURSES_QUERY_KEY } from "@/features/courses/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useCourses() {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

  return useQuery({
    queryKey: [...COURSES_QUERY_KEY, locale],
    queryFn: () => fetchCourses(locale),
    staleTime: 30_000,
  });
}
