import { useQuery } from "@tanstack/react-query";
import { fetchRegularAdminServices } from "../services/accreditation-services-api";

const QUERY_KEY = ["accreditation", "service-options"] as const;

export function useAccreditationServiceOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRegularAdminServices,
    staleTime: 60_000,
  });
}
