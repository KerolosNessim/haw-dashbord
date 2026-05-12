import { fetchAdminBlogs } from "@/features/blogs/services/blogs-api";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import {
  blogRecordToRow,
  normalizeAdminBlogListPayload,
  pickAdminBlogMeta,
  pickAdminBlogStatistics,
} from "@/features/blogs/utils/admin-blog-mapper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export type UseAdminBlogsParams = {
  /** 1-based page index for Laravel paginator. */
  page?: number;
  /** Optional override for the server's `per_page` (defaults to server default). */
  perPage?: number;
};

export function useAdminBlogs(params: UseAdminBlogsParams = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  const page = params.page && params.page > 0 ? params.page : 1;
  const perPage = params.perPage && params.perPage > 0 ? params.perPage : undefined;

  const requestParams: Record<string, string | number> = { page };
  if (perPage) requestParams.per_page = perPage;

  const query = useQuery({
    queryKey: [...ADMIN_BLOGS_QUERY_KEY, { page, perPage: perPage ?? null }] as const,
    queryFn: () => fetchAdminBlogs(requestParams),
    staleTime: 30_000,
    // Keep last page visible while the next one is loading to avoid blank tables.
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
