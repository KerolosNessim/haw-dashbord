import { useTranslation } from "react-i18next";
import { useState } from "react";
import { MessageCircle, Search, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceBookings } from "@/features/service-bookings/hooks/useServiceBookings";
import { useApplicationSeoSubmissions } from "@/features/service-bookings/hooks/useApplicationSeoSubmissions";
import BookingsTable from "@/features/service-bookings/components/bookings-table";
import SeoSubmissionsTable from "@/features/service-bookings/components/seo-submissions-table";
import AiToolSubmissionsTable from "@/features/service-bookings/components/ai-tool-submissions-table";

export default function ServiceBookingsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "consultation" });
  const [generalPage, setGeneralPage] = useState(1);
  const [seoPage, setSeoPage] = useState(1);

  const { data: bookingsData, isLoading: isBookingsLoading } = useServiceBookings(generalPage);
  const { data: seoData, isLoading: isSeoLoading } = useApplicationSeoSubmissions(seoPage);

  const bookings = bookingsData?.data?.data ?? [];
  const bookingsMeta = bookingsData?.data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  const seoSubmissions = seoData?.data?.data ?? [];
  const seoMeta = seoData?.data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-lg ps-15 font-medium leading-relaxed">
          {t("description")}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <div className="rounded-2xl border bg-white p-1 shadow-sm w-fit">
          <TabsList className="h-fit! gap-2 bg-transparent">
            <TabsTrigger
              value="general"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 me-2" />
              {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Search className="w-4 h-4 me-2" />
              {t("tabs.seo")}
            </TabsTrigger>
            <TabsTrigger
              value="ai_tools"
              className="rounded-xl px-8 h-10 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 me-2" />
              {t("tabs.ai_tools")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-0">
          <BookingsTable
            bookings={bookings}
            meta={bookingsMeta}
            isLoading={isBookingsLoading}
            onPageChange={setGeneralPage}
          />
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <SeoSubmissionsTable
            submissions={seoSubmissions}
            meta={seoMeta}
            isLoading={isSeoLoading}
            onPageChange={setSeoPage}
          />
        </TabsContent>

        <TabsContent value="ai_tools" className="mt-0">
          <AiToolSubmissionsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
