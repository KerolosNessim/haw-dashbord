import { SOLUTION_TAXONOMY_CATEGORIES_KEY } from "@/features/solution-categories/query-keys";
import { fetchSolutionCategoriesPage } from "@/features/solution-categories/services/taxonomy-categories-api";
import { useQuery } from "@tanstack/react-query";

export function useSolutionCategoriesPaged(params: { page: number; search: string }) {
  return useQuery({
    queryKey: [...SOLUTION_TAXONOMY_CATEGORIES_KEY, "page", params.page, "search", params.search.trim()],
    queryFn: () =>
      fetchSolutionCategoriesPage({
        page: params.page,
        perPage: 15,
        search: params.search.trim() || undefined,
      }),
  });
}
