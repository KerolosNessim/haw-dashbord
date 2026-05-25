import { fetchServiceCatalogList } from "@/features/service-catalog/services/service-catalog-api";
import { SERVICE_CATALOG_QUERY_KEY } from "@/features/service-catalog/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useServiceCatalogList() {
  return useQuery({
    queryKey: SERVICE_CATALOG_QUERY_KEY,
    queryFn: fetchServiceCatalogList,
  });
}
