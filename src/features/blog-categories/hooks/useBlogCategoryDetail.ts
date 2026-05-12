import { fetchBlogCategoryById } from "@/features/blog-categories/services/blog-categories-api";
import { BLOG_CATEGORIES_QUERY_KEY } from "@/features/blog-categories/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useBlogCategoryDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...BLOG_CATEGORIES_QUERY_KEY, "detail", id ?? "unknown"],
    queryFn: () => fetchBlogCategoryById(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
