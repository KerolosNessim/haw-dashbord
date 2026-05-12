import { fetchBlogCategories } from "@/features/blog-categories/services/blog-categories-api";
import { BLOG_CATEGORIES_QUERY_KEY } from "@/features/blog-categories/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useBlogCategories() {
  return useQuery({
    queryKey: BLOG_CATEGORIES_QUERY_KEY,
    queryFn: fetchBlogCategories,
    staleTime: 30_000,
  });
}
