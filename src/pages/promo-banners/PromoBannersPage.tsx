import { GalleryHorizontal, Layers, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionTab from "@/features/promo-banners/components/SectionTab";
import SlidesTab from "@/features/promo-banners/components/SlidesTab";
import HomeContentCountrySelector from "@/features/home-content/components/HomeContentCountrySelector";
import { HomeContentCountryProvider } from "@/features/home-content/context/home-content-country-context";

export default function PromoBannersPage() {
  const { t } = useTranslation("translation", { keyPrefix: "promo_banners" });

  return (
    <HomeContentCountryProvider>
      <div className="mx-auto max-w-[1400px] space-y-10 pb-20">
      <div className="flex flex-col gap-6 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GalleryHorizontal className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">{t("title")}</h1>
            <p className="font-medium text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <HomeContentCountrySelector />
      </div>

      <Tabs defaultValue="section" className="space-y-8">
        <div className="w-fit rounded-2xl border bg-white p-1 shadow-sm">
          <TabsList className="h-fit! gap-2 bg-transparent">
            <TabsTrigger
              value="section"
              className="h-10 rounded-xl px-8 font-bold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Settings className="me-2 h-4 w-4" />
              {t("tabs.section")}
            </TabsTrigger>
            <TabsTrigger
              value="slides"
              className="h-10 rounded-xl px-8 font-bold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Layers className="me-2 h-4 w-4" />
              {t("tabs.slides")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-[600px] rounded-[32px] border bg-white p-8 shadow-sm">
          <TabsContent value="section" className="mt-0 outline-none">
            <SectionTab />
          </TabsContent>
          <TabsContent value="slides" className="mt-0 outline-none">
            <SlidesTab />
          </TabsContent>
        </div>
      </Tabs>
      </div>
    </HomeContentCountryProvider>
  );
}
