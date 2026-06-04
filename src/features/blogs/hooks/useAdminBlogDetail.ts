import { fetchAdminBlogById, recordToBlogFormValues } from "@/features/blogs/services/blogs-api";
import { ADMIN_BLOG_DETAIL_QUERY_KEY } from "@/features/blogs/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAdminBlogDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...ADMIN_BLOG_DETAIL_QUERY_KEY, id ?? "unknown"],
    queryFn: async () => {
      const raw = await fetchAdminBlogById(id as string);
      return recordToBlogFormValues(raw);
    },
    enabled: Boolean(id),
  });
}
