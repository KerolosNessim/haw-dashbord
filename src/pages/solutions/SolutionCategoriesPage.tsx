import { Button } from "@/components/ui/button";
import SolutionCategoriesTable from "@/features/solution-categories/components/solution-categories-table";
import SolutionCategoryFormDialog from "@/features/solution-categories/components/solution-category-form-dialog";
import type { SolutionCategoryRow } from "@/features/solution-categories/types";
import { FolderTree, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function SolutionCategoriesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "solution_categories" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<SolutionCategoryRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setMode("create");
    setDialogOpen(true);
  };

  const openEdit = (row: SolutionCategoryRow) => {
    setEditing(row);
    setMode("edit");
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-gray-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              <FolderTree className="h-7 w-7" />
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
            <Link to="/solution-singles">{t("link_singles")}</Link>
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-12 rounded-xl px-8 text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            onClick={openCreate}
          >
            <Plus className="me-2 h-5 w-5" />
            {t("add_category")}
          </Button>
        </div>
      </div>

      <SolutionCategoriesTable onEdit={openEdit} />

      <SolutionCategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={mode}
        initial={editing}
      />
    </div>
  );
}
