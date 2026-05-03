import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CreateCategoryForm from "@/features/categories/components/create-category-form";

export default function CreateCategoryPage() {
  const { t } = useTranslation("translation", { keyPrefix: "categories" });
  const { t: commonT } = useTranslation("translation");
  const navigate = useNavigate();

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-8">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/categories")}
            className="w-12 h-12 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">{t("add_button")}</h1>
              <p className="text-muted-foreground font-medium">{t("description")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <CreateCategoryForm />
    </div>
  );
}
