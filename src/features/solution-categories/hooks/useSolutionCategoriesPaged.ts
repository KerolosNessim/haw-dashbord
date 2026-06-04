import { SOLUTION_TAXONOMY_CATEGORIES_KEY } from "@/features/solution-categories/query-keys";
import { fetchSolutionCategoriesPage } from "@/features/solution-categories/services/taxonomy-categories-api";
import { useQuery } from "@tanstack/react-query";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export function useSolutionCategoriesPaged(params: { page: number; search: string }) {
  const { countryIds, isCountryReady } = useHomeContentCountry();
  return useQuery({
    queryKey: [
      ...SOLUTION_TAXONOMY_CATEGORIES_KEY,
      countryIds,
      "page",
      params.page,
      "search",
      params.search.trim(),
    ],
    queryFn: () =>
      fetchSolutionCategoriesPage({
        page: params.page,
        perPage: 15,
        search: params.search.trim() || undefined,
        countryIds,
      }),
    enabled: isCountryReady,
  });
}
