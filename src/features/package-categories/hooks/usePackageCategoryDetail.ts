import {
  fetchPackageCategoryById,
} from "@/features/package-categories/services/package-categories-api";
import { PACKAGE_CATEGORIES_QUERY_KEY } from "@/features/package-categories/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export function usePackageCategoryDetail(id: string | undefined) {
  const { isCountryReady } = useHomeContentCountry();
  return useQuery({
    queryKey: [...PACKAGE_CATEGORIES_QUERY_KEY, id],
    queryFn: () => fetchPackageCategoryById(id as string),
    enabled: Boolean(id) && isCountryReady,
  });
}
