import { fetchPackageCategories } from "@/features/package-categories/services/package-categories-api";
import { PACKAGE_CATEGORIES_QUERY_KEY } from "@/features/package-categories/query-keys";
import { useQuery } from "@tanstack/react-query";

export function usePackageCategories() {
  return useQuery({
    queryKey: PACKAGE_CATEGORIES_QUERY_KEY,
    queryFn: fetchPackageCategories,
    staleTime: 30_000,
  });
}
