import {
  fetchPackageCategoryById,
} from "@/features/package-categories/services/package-categories-api";
import { PACKAGE_CATEGORIES_QUERY_KEY } from "@/features/package-categories/query-keys";
import { useQuery } from "@tanstack/react-query";

export function usePackageCategoryDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...PACKAGE_CATEGORIES_QUERY_KEY, id],
    queryFn: () => fetchPackageCategoryById(id as string),
    enabled: Boolean(id),
  });
}
