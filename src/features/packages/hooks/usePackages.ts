import { fetchPackagesPage } from "@/features/packages/services/packages-api";
import { PACKAGES_QUERY_KEY } from "@/features/packages/query-keys";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export type UsePackagesParams = {
  page?: number;
  perPage?: number;
  search?: string;
};

export function usePackages(params: UsePackagesParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith("ar") ? "ar" : "en";
  const { countryIds, isCountryReady } = useHomeContentCountry();
  const page = params.page && params.page > 0 ? params.page : 1;
  const perPage = params.perPage && params.perPage > 0 ? params.perPage : undefined;
  const search = params.search?.trim() ? params.search.trim() : undefined;

  const query = useQuery({
    queryKey: [
      ...PACKAGES_QUERY_KEY,
      locale,
      countryIds,
      { page, perPage: perPage ?? null, search: search ?? null },
    ] as const,
    queryFn: () => fetchPackagesPage(locale, { page, perPage, search, countryIds }),
    enabled: isCountryReady,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    rows: query.data?.rows ?? [],
    meta: query.data?.meta ?? { currentPage: page, lastPage: 1, perPage: 0, total: 0 },
  };
}
