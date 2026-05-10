import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactTab from "@/features/about-us/components/ContactTab";
import GeneralTab from "@/features/about-us/components/GeneralTab";
import IntroTab from "@/features/about-us/components/IntroTab";
import VisionTab from "@/features/about-us/components/VisionTab";
import WhyUsTab from "@/features/about-us/components/WhyUsTab";
import { HelpCircle, Info, MessageCircle, Target } from "lucide-react";
import { useTranslation } from "react-i18next";


/**
 * AboutUsPage Component
 * 
 * Main page for managing About Us content with multiple tabs.
 */
export default function AboutUsPage() {
  const { t } = useTranslation("translation", {
    keyPrefix: "about",
  });





  return (
    <div className="p-4 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Info className="w-7 h-7 text-primary" />
          </div>
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg font-medium ps-16">
          {t("description")}
        </p>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/40 p-1.5 rounded-[24px] h-auto mb-10 border border-border/40 inline-flex">
          <TabsTrigger
            value="general"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <Info className="w-4 h-4" />
            {t("tabs.general")}
          </TabsTrigger>
          <TabsTrigger
            value="intro"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <Info className="w-4 h-4" />
            {t("tabs.intro")}
          </TabsTrigger>
          <TabsTrigger
            value="vision"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <Target className="w-4 h-4" />
            {t("tabs.vision")}
          </TabsTrigger>
          <TabsTrigger
            value="why_us"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            {t("tabs.why_us")}
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="rounded-[18px] px-8 py-3.5 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {t("tabs.contact")}
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-[48px] border border-border/60 p-8 md:p-12 shadow-2xl shadow-gray-200/50">
          <TabsContent value="general" className="m-0 outline-none">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="intro" className="m-0 outline-none">
            <IntroTab />
          </TabsContent>
          <TabsContent value="vision" className="m-0 outline-none">
            <VisionTab />
          </TabsContent>
          <TabsContent value="why_us" className="m-0 outline-none">
            <WhyUsTab />
          </TabsContent>
          <TabsContent value="contact" className="m-0 outline-none">
            <ContactTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
