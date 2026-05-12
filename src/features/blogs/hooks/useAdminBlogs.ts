import { fetchAdminBlogs } from "@/features/blogs/services/blogs-api";
import { ADMIN_BLOGS_QUERY_KEY } from "@/features/blogs/query-keys";
import { blogRecordToRow, normalizeAdminBlogListPayload } from "@/features/blogs/utils/admin-blog-mapper";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useAdminBlogs() {
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";

  const query = useQuery({
    queryKey: ADMIN_BLOGS_QUERY_KEY,
    queryFn: () => fetchAdminBlogs(),
    staleTime: 30_000,
  });

  const rawList = normalizeAdminBlogListPayload(query.data);
  const rows = rawList
    .map((b) => blogRecordToRow(b, locale))
    .filter((r): r is NonNullable<typeof r> => r != null);

  return {
    ...query,
    blogs: rows,
  };
}
