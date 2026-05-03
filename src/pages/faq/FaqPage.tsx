import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import FaqStats from "@/features/faq/components/faq-stats";
import FaqTable from "@/features/faq/components/faq-table";
import { Link } from "react-router-dom";

export default function FaqPage() {
  const { t } = useTranslation("translation", { keyPrefix: "faq" });

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

      <FaqStats />

      <FaqTable />
    </div>
  );
}
