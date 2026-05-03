import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CategoriesTable from "@/features/categories/components/categories-table";

export default function CategoriesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "categories" });
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">{t("title")}</h1>
            <p className="text-muted-foreground text-lg font-medium">{t("description")}</p>
          </div>
        </div>

        <Button 
          size="lg" 
          onClick={() => navigate("/categories/create")}
          className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 mr-2" />
          {t("add_button")}
        </Button>
      </div>

      {/* Main Table Content */}
      <CategoriesTable />
    </div>
  );
}
