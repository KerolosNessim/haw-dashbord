import { fetchPackageById } from "@/features/packages/services/packages-api";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { useQuery } from "@tanstack/react-query";

export function usePackageDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, "one", id],
    queryFn: () => fetchPackageById(id as string),
    enabled: Boolean(id),
  });
}
