import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  Users
} from "lucide-react";
import { useTranslation } from "react-i18next";
import HeroTab from "@/features/home-content/components/HeroTab";
import StatesTab from "@/features/home-content/components/StatesTab";
import DependenciesTab from "@/features/home-content/components/DependenciesTab";
import ClientsTab from "@/features/home-content/components/ClientsTab";

/**
 * HomeContentPage
 * 
 * Main management page for home page sections.
 * Uses a tabbed layout to separate different sections of the home page.
 */
export default function HomeContentPage() {
  const { t } = useTranslation("translation", { keyPrefix: "home_content" });

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <SettingsIcon className="w-7 h-7" />
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
      <Tabs defaultValue="hero" className="space-y-8">
        <div className="bg-white p-1 rounded-2xl border shadow-sm w-fit">
          <TabsList className="bg-transparent gap-2 h-fit!">
            <TabsTrigger
              value="hero"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              {t("tabs.hero")}
            </TabsTrigger>

            <TabsTrigger
              value="states"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("tabs.states")}
            </TabsTrigger>
            
            <TabsTrigger
              value="dependencies"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t("tabs.dependencies")}
            </TabsTrigger>
            
            <TabsTrigger
              value="our_clients"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              {t("tabs.our_clients")}
            </TabsTrigger>

          </TabsList>
        </div>

        <div className="bg-white p-8 rounded-[32px] border shadow-sm min-h-[600px]">
          <TabsContent value="hero" className="mt-0 outline-none">
            <HeroTab />
          </TabsContent>
          
          <TabsContent value="states" className="mt-0 outline-none">
            <StatesTab />
          </TabsContent>
          
          <TabsContent value="dependencies" className="mt-0 outline-none">
            <DependenciesTab />
          </TabsContent>
          
          <TabsContent value="our_clients" className="mt-0 outline-none">
            <ClientsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
