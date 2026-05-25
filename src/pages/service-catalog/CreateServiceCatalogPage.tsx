import ServiceCatalogForm from "@/features/service-catalog/components/service-catalog-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function CreateServiceCatalogPage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "service_catalog" });
  const isRtl = i18n.language.startsWith("ar");

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Link to="/service-catalog" className="w-fit">
        <Button
          variant="ghost"
          className="group rounded-full pr-4 pl-2 font-bold text-muted-foreground hover:bg-primary/5"
        >
          {isRtl ? (
            <ChevronRight className="mr-1 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          ) : (
            <ChevronLeft className="ml-1 mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          )}
          {t("all_items")}
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("create_title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">{t("create_description")}</p>
      </div>

      <ServiceCatalogForm mode="create" />
    </div>
  );
}
