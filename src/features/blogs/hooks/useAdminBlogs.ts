import { fetchAdminBlogs } from "@/features/blogs/services/blogs-api";
import { countryIdsQuery } from "@/features/home-content/lib/country-scope";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import {
  blogRecordToRow,
  normalizeAdminBlogListPayload,
  pickAdminBlogMeta,
  pickAdminBlogStatistics,
} from "@/features/blogs/utils/admin-blog-mapper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

export type UseAdminBlogsParams = {
  page?: number;
  perPage?: number;
};

export function useAdminBlogs(params: UseAdminBlogsParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";
  const { countryIds, isCountryReady } = useHomeContentCountry();

  const page = params.page && params.page > 0 ? params.page : 1;
  const perPage = params.perPage && params.perPage > 0 ? params.perPage : undefined;

  const requestParams: Record<string, string | number | string[]> = { page };
  if (perPage) requestParams.per_page = perPage;
  const countryParams = countryIdsQuery(countryIds);
  if (countryParams) Object.assign(requestParams, countryParams);

  const query = useQuery({
    queryKey: [...ADMIN_BLOGS_QUERY_KEY, countryIds, { page, perPage: perPage ?? null }] as const,
    queryFn: () => fetchAdminBlogs(requestParams),
    enabled: isCountryReady,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const rawList = normalizeAdminBlogListPayload(query.data);
  const rows = rawList
    .map((b) => blogRecordToRow(b, locale))
    .filter((r): r is NonNullable<typeof r> => r != null);

  const statistics = pickAdminBlogStatistics(query.data);
  const meta = pickAdminBlogMeta(query.data);

  return {
    ...query,
    blogs: rows,
    statistics,
    meta,
  };
}
