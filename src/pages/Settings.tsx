import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Globe, MapPin, Clock, Share2, Search, Phone, Code2, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GeneralSettingsForm from "@/features/settings/components/general-settings-form";
import OfficesRepeater from "@/features/settings/components/offices-repeater";
import ContactSettingsForm from "@/features/settings/components/contact-settings-form";
import WorkingHoursForm from "@/features/settings/components/working-hours-form";
import SocialMediaRepeater from "@/features/settings/components/social-media-repeater";
import SeoSettingsRepeater from "@/features/settings/components/seo-settings-repeater";
import ScriptsSettingsForm from "@/features/settings/components/scripts-settings-form";

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
        <Link to="/backup-export">
          <Button type="button" variant="outline" size="lg" className="rounded-xl font-bold">
            <Database className="mr-2 size-5" />
            {t("backup_export_link")}
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs  defaultValue="general" className="space-y-8">
        <div className="bg-white p-1 rounded-2xl border shadow-sm w-fit flex flex-wrap">
          <TabsList className="bg-transparent gap-2 h-fit! flex-wrap">
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
            <TabsTrigger 
              value="scripts" 
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Code2 className="w-4 h-4 mr-2" />
              {t("tabs.scripts")}
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
          <TabsContent value="scripts" className="mt-0 outline-none">
            <ScriptsSettingsForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

