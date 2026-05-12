import { SOLUTION_TAXONOMY_CATEGORIES_KEY } from "@/features/solution-categories/query-keys";
import { fetchAllSolutionCategories } from "@/features/solution-categories/services/taxonomy-categories-api";
import { useQuery } from "@tanstack/react-query";

export function useAllSolutionCategories() {
  return useQuery({
    queryKey: [...SOLUTION_TAXONOMY_CATEGORIES_KEY, "all"],
    queryFn: fetchAllSolutionCategories,
    staleTime: 60_000,
  });
}
