import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useServiceBookings } from "@/features/service-bookings/hooks/useServiceBookings";
import BookingsTable from "@/features/service-bookings/components/bookings-table";
import { MessageCircle } from "lucide-react";

export default function ServiceBookingsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "consultation" });
  const [page, setPage] = useState(1);
  const { data, isLoading } = useServiceBookings(page);

  const bookings = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
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

      {/* Table Section */}
      <BookingsTable
        bookings={bookings}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}
