import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import BlogForm from "@/features/blogs/components/blog-form";
import { HomeContentCountryProvider, useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";
import { useMemo } from "react";
import type { BlogFormValues } from "@/features/blogs/blog-form-schema";

function CreateBlogPageContent() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "blogs" });
  const isRtl = i18n.language.startsWith("ar");
  const { countryIds } = useHomeContentCountry();

  const defaultCountryIds = useMemo(
    () => countryIds.map(String),
    [countryIds],
  );

  const initialValues = useMemo<Partial<BlogFormValues>>(
    () => ({ country_ids: defaultCountryIds }),
    [defaultCountryIds],
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col gap-6">
        <Link to="/blogs" className="w-fit">
          <Button variant="ghost" className="rounded-full pl-2 pr-4 hover:bg-primary/5 text-muted-foreground group font-bold">
            {isRtl ? <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform rotate-180" /> : <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />}
            {t("all_blogs")}
          </Button>
        </Link>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("add_blog")}</h1>
          <p className="text-muted-foreground text-lg font-medium">{t("description")}</p>
        </div>
      </div>

      <BlogForm mode="create" initialValues={initialValues as BlogFormValues} />
    </div>
  );
}

export default function CreateBlogPage() {
  return (
    <HomeContentCountryProvider>
      <CreateBlogPageContent />
    </HomeContentCountryProvider>
  );
}
