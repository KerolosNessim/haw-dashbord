import PackageCategoryForm from "@/features/package-categories/components/package-category-form";
import { usePackageCategoryDetail } from "@/features/package-categories/hooks/usePackageCategoryDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

export default function EditPackageCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation("translation", { keyPrefix: "package_categories" });
  const isRtl = i18n.language.startsWith("ar");
  const { data: initialValues, isLoading, isError } = usePackageCategoryDetail(id);

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Link to="/package-categories" className="w-fit">
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
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("edit_title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">{t("edit_description")}</p>
      </div>

      {isError && (
        <p className="text-sm text-destructive">{t("load_one_error")}</p>
      )}

      <PackageCategoryForm mode="edit" categoryId={id} initialValues={initialValues ?? null} isInitialLoading={isLoading} />
    </div>
  );
}
