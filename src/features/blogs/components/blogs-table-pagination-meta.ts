import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import type { AdminBlogMeta } from "@/features/blogs/utils/admin-blog-mapper";

/** Maps admin list `meta` + current filtered row count to Laravel pagination footer state. */
export function buildBlogsTablePaginationState(
  meta: AdminBlogMeta,
  filteredRowCount: number,
): {
  laravelMeta: LaravelPaginationMeta;
  rangeStart: number;
  rangeEnd: number;
  serverTotal: number;
} {
  const total = filteredRowCount;
  const serverTotal = meta.total > 0 ? meta.total : total;
  const perPage = meta.perPage > 0 ? meta.perPage : Math.max(filteredRowCount, 1);
  const rangeStart = serverTotal === 0 ? 0 : (meta.currentPage - 1) * perPage + 1;
  const rangeEnd =
    serverTotal === 0 ? 0 : Math.min(rangeStart + filteredRowCount - 1, serverTotal);

  const laravelMeta: LaravelPaginationMeta = {
    current_page: meta.currentPage || 1,
    last_page: meta.lastPage || 1,
    per_page: perPage,
    total: serverTotal,
    from: rangeStart || null,
    to: rangeEnd || null,
    path: "",
  };

  return { laravelMeta, rangeStart, rangeEnd, serverTotal };
}
