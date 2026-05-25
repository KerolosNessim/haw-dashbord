import { fetchServiceCatalogById } from "@/features/service-catalog/services/service-catalog-api";
import { SERVICE_CATALOG_QUERY_KEY } from "@/features/service-catalog/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useServiceCatalogDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...SERVICE_CATALOG_QUERY_KEY, "detail", id],
    queryFn: () => fetchServiceCatalogById(id as string),
    enabled: Boolean(id),
  });
}
