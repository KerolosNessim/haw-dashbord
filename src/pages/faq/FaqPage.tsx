import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import FaqStats from "@/features/faq/components/faq-stats";
import FaqTable from "@/features/faq/components/faq-table";
import GeneralTab from "@/features/faq/components/GeneralTab";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, List } from "lucide-react";
import { useFaqGeneral } from "@/features/faq/hooks/useFaqGeneral";

export default function FaqPage() {
  const { t } = useTranslation("translation", { keyPrefix: "faq" });
  const { getGeneralQuery } = useFaqGeneral();
  const { data: faqData, isLoading } = getGeneralQuery;

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      {/* header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>

        <Link to="/faq/create">
          <Button
            size="lg"
            className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("add_faq")}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/10 p-1 rounded-[24px] mb-10 border border-border/40 inline-flex">
          <TabsTrigger
            value="general"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <Info className="w-4 h-4" />
            {t("tabs.general")}
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <List className="w-4 h-4" />
            {t("tabs.list")}
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-[48px] border border-border/60 p-8 md:p-12 shadow-2xl shadow-gray-200/50">
          <TabsContent value="general" className="m-0 outline-none">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="list" className="m-0 outline-none space-y-10">
            <FaqStats 
              data={faqData?.data?.items || []} 
              isLoading={isLoading} 
            />
            <FaqTable 
              data={faqData?.data?.items || []} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
