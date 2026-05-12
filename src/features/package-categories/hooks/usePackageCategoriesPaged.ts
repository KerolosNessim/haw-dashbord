import { fetchPackageCategoriesPage } from "@/features/package-categories/services/package-categories-api";
import { PACKAGE_CATEGORIES_PAGED_QUERY_KEY } from "@/features/package-categories/query-keys";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type UsePackageCategoriesPagedParams = {
  page?: number;
  perPage?: number;
};

export function usePackageCategoriesPaged(params: UsePackageCategoriesPagedParams = {}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const perPage = params.perPage && params.perPage > 0 ? params.perPage : undefined;

  const query = useQuery({
    queryKey: [...PACKAGE_CATEGORIES_PAGED_QUERY_KEY, { page, perPage: perPage ?? null }] as const,
    queryFn: () => fetchPackageCategoriesPage({ page, perPage }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const rows = query.data?.rows ?? [];
  const meta = query.data?.meta ?? {
    currentPage: page,
    lastPage: 1,
    perPage: 0,
    total: 0,
  };

  return {
    ...query,
    rows,
    meta,
  };
}
