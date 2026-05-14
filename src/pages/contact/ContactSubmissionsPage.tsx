import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useContactSubmissions } from "@/features/contact/hooks/useContactSubmissions";
import SubmissionsTable from "@/features/contact/components/submissions-table";
import { MessageSquare } from "lucide-react";

export default function ContactSubmissionsPage() {
  const { t } = useTranslation("translation", { keyPrefix: "contact" });
  const [page, setPage] = useState(1);
  const { data, isLoading } = useContactSubmissions(page);

  const submissions = data?.data?.data ?? [];
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
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground text-lg ps-15">
          {t("description")}
        </p>
      </div>

      {/* Table Section */}
      <SubmissionsTable
        submissions={submissions}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}
