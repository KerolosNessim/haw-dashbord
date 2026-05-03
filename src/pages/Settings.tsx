import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Globe, MapPin, Clock, Share2, Search, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import GeneralSettingsForm from "@/features/settings/components/general-settings-form";
import OfficesRepeater from "@/features/settings/components/offices-repeater";
import ContactSettingsForm from "@/features/settings/components/contact-settings-form";
import WorkingHoursForm from "@/features/settings/components/working-hours-form";
import SocialMediaRepeater from "@/features/settings/components/social-media-repeater";
import SeoSettingsRepeater from "@/features/settings/components/seo-settings-repeater";

export default function SettingsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <SettingsIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">{t("title")}</h1>
            <p className="text-muted-foreground font-medium">{t("description")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs  defaultValue="general" className="space-y-8">
        <div className="bg-white p-1 rounded-2xl border shadow-sm w-fit">
          <TabsList className="bg-transparent gap-2 h-fit!">
            <TabsTrigger 
              value="general" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Globe className="w-4 h-4 mr-2" />
              {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Phone className="w-4 h-4 mr-2" />
              {t("tabs.contact")}
            </TabsTrigger>
            <TabsTrigger 
              value="offices" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t("tabs.offices")}
            </TabsTrigger>
            <TabsTrigger 
              value="working_hours" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Clock className="w-4 h-4 mr-2" />
              {t("tabs.working_hours")}
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t("tabs.social")}
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Search className="w-4 h-4 mr-2" />
              {t("tabs.seo")}
            </TabsTrigger>
          </TabsList>
        </div>

        <div  className="bg-white p-8 rounded-[32px] border shadow-sm min-h-[600px]">
          <TabsContent value="general" className="mt-0 outline-none">
            <GeneralSettingsForm />
          </TabsContent>
          <TabsContent value="contact" className="mt-0 outline-none">
            <ContactSettingsForm />
          </TabsContent>
          <TabsContent value="offices" className="mt-0 outline-none">
            <OfficesRepeater />
          </TabsContent>
          <TabsContent value="working_hours" className="mt-0 outline-none">
            <WorkingHoursForm />
          </TabsContent>
          <TabsContent value="social" className="mt-0 outline-none">
            <SocialMediaRepeater />
          </TabsContent>
          <TabsContent value="seo" className="mt-0 outline-none">
            <SeoSettingsRepeater />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
