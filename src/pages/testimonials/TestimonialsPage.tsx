import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Settings as SettingsIcon,
  Users
} from "lucide-react";
import { useTranslation } from "react-i18next";
import GeneralTab from "@/features/testimonials/components/GeneralTab";
import TestimonialsListTab from "@/features/testimonials/components/TestimonialsListTab";

/**
 * TestimonialsPage
 * 
 * Management page for testimonials section.
 */
export default function TestimonialsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "testimonials" });

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
            <p className="text-muted-foreground font-medium">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-8">
        <div className="bg-white p-1 rounded-2xl border shadow-sm w-fit">
          <TabsList className="bg-transparent gap-2 h-fit!">
            <TabsTrigger
              value="general"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              {t("tabs.general")}
            </TabsTrigger>

            <TabsTrigger
              value="list"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              {t("tabs.list")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white p-8 rounded-[32px] border shadow-sm min-h-[600px]">
          <TabsContent value="general" className="mt-0 outline-none">
            <GeneralTab />
          </TabsContent>
          
          <TabsContent value="list" className="mt-0 outline-none">
            <TestimonialsListTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
