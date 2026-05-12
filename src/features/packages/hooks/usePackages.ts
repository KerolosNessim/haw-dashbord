import { fetchPackages } from "@/features/packages/services/packages-api";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function usePackages() {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";

  return useQuery({
    queryKey: [...PACKAGES_QUERY_KEY, locale],
    queryFn: () => fetchPackages(locale),
    staleTime: 30_000,
  });
}
