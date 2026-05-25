import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import BlogsStats from "@/features/blogs/components/blogs-stats";
import BlogsTable from "@/features/blogs/components/blogs-table";
import { Can } from "@/features/permissions/components/PermissionGate";

export default function BlogsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "blogs" });

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("title")}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Can permission="blog-categories.view">
            <Link to="/blog-categories">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-xl px-6 h-12 font-bold text-base border-border/60 hover:bg-muted/40"
              >
                <LayoutGrid className="w-5 h-5 mr-2" />
                {t("manage_categories")}
              </Button>
            </Link>
          </Can>
          <Can permission="blogs.create">
            <Link to="/blogs/create">
              <Button
                size="lg"
                className="rounded-xl px-8 h-12 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("add_blog")}
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      <BlogsStats />

      <BlogsTable />
    </div>
  );
}
