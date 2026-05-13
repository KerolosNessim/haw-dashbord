import { COURSE_TAXONOMY_CATEGORIES_KEY } from "@/features/categories/query-keys";
import { fetchCourseCategoriesPage } from "@/features/categories/services/course-categories-api";
import { useQuery } from "@tanstack/react-query";

export function useCourseCategoriesPaged(params: { page: number; search: string }) {
  return useQuery({
    queryKey: [...COURSE_TAXONOMY_CATEGORIES_KEY, "page", params.page, "search", params.search.trim()],
    queryFn: () =>
      fetchCourseCategoriesPage({
        page: params.page,
        perPage: 15,
        search: params.search.trim() || undefined,
      }),
  });
}
