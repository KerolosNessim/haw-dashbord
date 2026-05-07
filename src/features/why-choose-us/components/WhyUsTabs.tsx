import { LayoutList, Settings2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import GeneralTab from "./GeneralTab";
import ContentTab from "./ContentTab";

export default function WhyUsTabs() {
  const { t } = useTranslation("translation", {
    keyPrefix: "why_choose_us",
  });

  return (
    <div className="space-y-8">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/10 p-1 rounded-2xl border border-border/40 mb-8">
          <TabsTrigger
            value="general"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all gap-2"
          >
            <Settings2 className="w-4 h-4" />
            {t("tabs.general")}
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all gap-2"
          >
            <LayoutList className="w-4 h-4" />
            {t("tabs.content")}
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-[40px] border border-border/60 p-8 md:p-12 shadow-sm">
          <TabsContent value="general" className="m-0 outline-none">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="content" className="m-0 outline-none">
            <ContentTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
