import { fetchPackageById } from "@/features/packages/services/packages-api";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export function usePackageDetail(id: string | undefined) {
  const { isCountryReady } = useHomeContentCountry();
  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, "one", id],
    queryFn: () => fetchPackageById(id as string),
    enabled: Boolean(id) && isCountryReady,
  });
}
