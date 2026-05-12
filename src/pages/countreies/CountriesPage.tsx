
import { Button } from "@/components/ui/button";
import { Plus, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import CountriesTable from "@/features/countries/components/countries-table";
import CountryDialog from "@/features/countries/components/country-dialog";

export default function CountriesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "countries" });
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed font-medium">
            {t("description")}
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => setDialogOpen(true)}
          className="rounded-2xl px-8 h-14 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold text-lg gap-2"
        >
          <Plus className="w-6 h-6" />
          {t("add_button")}
        </Button>
      </div>

      <CountriesTable />

      <CountryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        country={null}
      />
    </div>
  );
}

