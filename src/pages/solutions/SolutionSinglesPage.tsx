import { Button } from "@/components/ui/button";
import SolutionSinglesTable from "@/features/solutions/components/solution-singles-table";
import SolutionsSectionDialog from "@/features/solutions/components/solutions-section-dialog";
import type { SolutionFeature } from "@/features/solutions/types";
import { Lightbulb, Plus, Settings2, Tags } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function SolutionSinglesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "solutions" });
  const navigate = useNavigate();
  const [sectionOpen, setSectionOpen] = useState(false);

  const openEdit = (row: SolutionFeature) => {
    if (row.id == null) return;
    navigate(`/solution-singles/edit/${row.id}`, { state: { row } });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-gray-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <Lightbulb className="h-7 w-7" />
            </span>
            {t("title")}
          </h1>
          <p className="ms-0 max-w-2xl text-lg font-medium text-muted-foreground md:ms-[60px]">{t("description")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-border/60 px-6 text-base font-bold hover:bg-muted/40"
            asChild
          >
            <Link to="/solution-categories">
              <Tags className="me-2 h-5 w-5" />
              {t("manage_categories")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 rounded-xl border-border/60 px-6 text-base font-bold hover:bg-muted/40"
            onClick={() => setSectionOpen(true)}
          >
            <Settings2 className="me-2 h-5 w-5" />
            {t("section_settings")}
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-12 rounded-xl px-8 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => navigate("/solution-singles/create")}
          >
            <Plus className="me-2 h-5 w-5" />
            {t("add_solution")}
          </Button>
        </div>
      </div>

      <SolutionSinglesTable onEdit={openEdit} />

      <SolutionsSectionDialog open={sectionOpen} onOpenChange={setSectionOpen} />
    </div>
  );
}
