import { ShieldQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";
import WhyUsTabs from "@/features/why-choose-us/components/WhyUsTabs";
import HomeContentCountrySelector from "@/features/home-content/components/HomeContentCountrySelector";
import { HomeContentCountryProvider } from "@/features/home-content/context/home-content-country-context";

export default function WhyChooseUsPage() {
  const { t } = useTranslation("translation", {
    keyPrefix: "why_choose_us",
  });

  return (
    <HomeContentCountryProvider>
      <div className="max-w-[1200px] mx-auto space-y-10 py-6">
        {/* Page Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <ShieldQuestion className="w-7 h-7" />
              </div>
              {t("title")}
            </h1>
            <p className="text-muted-foreground font-medium text-lg ms-16">
              {t("description")}
            </p>
          </div>
          <HomeContentCountrySelector />
        </div>

        <WhyUsTabs />
      </div>
    </HomeContentCountryProvider>
  );
}
