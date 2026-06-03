import { Briefcase, Layers, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemsTab from "@/features/client-portfolio/components/ItemsTab";
import SectionTab from "@/features/client-portfolio/components/SectionTab";

export default function ClientPortfolioPage() {
  const { t } = useTranslation("translation", { keyPrefix: "client_portfolio" });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "items" ? "items" : "section";

  return (
    <div className="mx-auto max-w-[1400px] space-y-10 pb-20">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Briefcase className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
          <p className="font-medium text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(tab) => {
          if (tab === "items") setSearchParams({ tab: "items" });
          else setSearchParams({});
        }}
        className="space-y-8"
      >
        <div className="w-fit rounded-2xl border bg-white p-1 shadow-sm">
          <TabsList className="h-fit! gap-2 bg-transparent">
            <TabsTrigger
              value="section"
              className="h-10 rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Settings className="me-2 h-4 w-4" />
              {t("tabs.section")}
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="h-10 rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Layers className="me-2 h-4 w-4" />
              {t("tabs.items")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-[600px] rounded-[32px] border bg-white p-8 shadow-sm">
          <TabsContent value="section" className="mt-0 outline-none">
            <SectionTab />
          </TabsContent>
          <TabsContent value="items" className="mt-0 outline-none">
            <ItemsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
