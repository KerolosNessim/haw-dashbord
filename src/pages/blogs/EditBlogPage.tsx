import { Button } from "@/components/ui/button";
import BlogForm from "@/features/blogs/components/blog-form";
import { useAdminBlogDetail } from "@/features/blogs/hooks/useAdminBlogDetail";
import { fetchAdminBlogById } from "@/features/blogs/services/blogs-api";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("translation", { keyPrefix: "blogs" });
  const isRtl = i18n.language.startsWith("ar");

  const { data: initialValues, isLoading, isError } = useAdminBlogDetail(id);

  const { data: rawBlog } = useQuery({
    queryKey: ["admin", "blogs", "detail-raw", id ?? "unknown"],
    queryFn: () => fetchAdminBlogById(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const initialImageUrl = (() => {
    if (!rawBlog || typeof rawBlog !== "object") return null;
    const r = rawBlog as Record<string, unknown>;
    if (typeof r.image === "string") return r.image;
    if (r.image && typeof r.image === "object") {
      const url = (r.image as Record<string, unknown>).url;
      if (typeof url === "string") return url;
    }
    if (typeof r.image_url === "string") return r.image_url;
    return null;
  })();

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <Link to="/blogs" className="w-fit">
        <Button
          variant="ghost"
          className="rounded-full pl-2 pr-4 hover:bg-primary/5 text-muted-foreground group font-bold"
        >
          {isRtl ? (
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform rotate-180" />
          ) : (
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          )}
          {t("all_blogs")}
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("edit_title")}</h1>
        <p className="text-muted-foreground text-lg font-medium">{t("edit_description")}</p>
      </div>

      {isError && <p className="text-sm text-destructive">{t("api.load_one_error")}</p>}

      <BlogForm
        mode="edit"
        blogId={id}
        initialValues={initialValues ?? null}
        initialImageUrl={initialImageUrl}
        isInitialLoading={isLoading}
      />
    </div>
  );
}
