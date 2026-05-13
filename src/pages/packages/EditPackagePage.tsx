import PackageForm from "@/features/packages/components/package-form";
import { usePackageDetail } from "@/features/packages/hooks/usePackageDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";

type PackageEditLocationState = {
  packageCategoryId?: string;
  categoryTitle?: string;
};

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { t, i18n } = useTranslation("translation", { keyPrefix: "packages" });
  const isRtl = i18n.language.startsWith("ar");
  const { data: initialValues, isLoading, isError } = usePackageDetail(id);
  const routeState = location.state as PackageEditLocationState | null;
  const fallbackCategoryId =
    typeof routeState?.packageCategoryId === "string" ? routeState.packageCategoryId.trim() : "";
  const fallbackCategoryTitle =
    typeof routeState?.categoryTitle === "string" ? routeState.categoryTitle.trim() : "";
  const formInitialValues = initialValues
    ? {
        ...initialValues,
        package_category_id: initialValues.package_category_id || fallbackCategoryId,
        categoryTitleAr: initialValues.categoryTitleAr || fallbackCategoryTitle,
        categoryTitleEn: initialValues.categoryTitleEn || fallbackCategoryTitle,
      }
    : initialValues;

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Link to="/packages" className="w-fit">
        <Button
          variant="ghost"
          className="rounded-full pr-4 pl-2 font-bold text-muted-foreground hover:bg-primary/5 group"
        >
          {isRtl ? (
            <ChevronRight className="mr-1 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          ) : (
            <ChevronLeft className="ml-1 mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          )}
          {t("all_packages")}
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("edit_title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">{t("edit_description")}</p>
      </div>

      {isError && <p className="text-sm text-destructive">{t("load_one_error")}</p>}

      <PackageForm mode="edit" packageId={id} initialValues={formInitialValues ?? null} isInitialLoading={isLoading} />
    </div>
  );
}
