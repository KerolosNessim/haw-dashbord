import PackageForm from "@/features/packages/components/package-form";
import type { PackageFormValues } from "@/features/packages/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HomeContentCountryProvider, useHomeContentCountry } from "@/features/home-content/context/home-content-country-context";

function CreatePackagePageContent() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "packages" });
  const isRtl = i18n.language.startsWith("ar");
  const { countryIds } = useHomeContentCountry();
  const initialValues = useMemo<Partial<PackageFormValues>>(
    () => ({ country_ids: countryIds.map(String) }),
    [countryIds],
  );

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
        <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("create_title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">{t("create_description")}</p>
      </div>

      <PackageForm mode="create" initialValues={initialValues as PackageFormValues} />
    </div>
  );
}

export default function CreatePackagePage() {
  return (
    <HomeContentCountryProvider>
      <CreatePackagePageContent />
    </HomeContentCountryProvider>
  );
}
