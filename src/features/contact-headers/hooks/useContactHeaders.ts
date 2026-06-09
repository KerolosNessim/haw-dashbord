import { useQuery } from "@tanstack/react-query";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";
import { CONTACT_HEADERS_QUERY_KEY } from "../query-keys";
import { fetchContactHeaders } from "../services/contact-headers-api";

export function useContactHeaders() {
  const { countryIds, isCountryReady } = useHomeContentCountry();

  return useQuery({
    queryKey: [...CONTACT_HEADERS_QUERY_KEY, countryIds],
    queryFn: () => fetchContactHeaders(countryIds),
    enabled: isCountryReady,
  });
}
