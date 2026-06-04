import { fetchPackageCategories } from "@/features/package-categories/services/package-categories-api";
import { PACKAGE_CATEGORIES_QUERY_KEY } from "@/features/package-categories/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export function usePackageCategories() {
  const { countryIds, isCountryReady } = useHomeContentCountry();
  return useQuery({
    queryKey: [...PACKAGE_CATEGORIES_QUERY_KEY, countryIds],
    queryFn: () => fetchPackageCategories(countryIds),
    enabled: isCountryReady,
    staleTime: 30_000,
  });
}
