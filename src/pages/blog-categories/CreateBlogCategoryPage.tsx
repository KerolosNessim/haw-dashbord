import BlogCategoryForm from "@/features/blog-categories/components/blog-category-form";
import { useBlogCategories } from "@/features/blog-categories/hooks/useBlogCategories";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function CreateBlogCategoryPage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "blog_categories" });
  const isRtl = i18n.language.startsWith("ar");
  const { data: existingCategories = [] } = useBlogCategories();

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Link to="/blog-categories" className="w-fit">
        <Button
          variant="ghost"
          className="rounded-full pr-4 pl-2 font-bold text-muted-foreground hover:bg-primary/5 group"
        >
          {isRtl ? (
            <ChevronRight className="mr-1 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          ) : (
            <ChevronLeft className="ml-1 mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          )}
          {t("all_categories")}
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("create_title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">{t("create_description")}</p>
      </div>

      <BlogCategoryForm mode="create" existingCategories={existingCategories} />
    </div>
  );
}
