import { Button } from "@/components/ui/button";
import SolutionSingleForm from "@/features/solutions/components/solution-single-form";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function CreateSolutionSinglePage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "solutions" });
  const navigate = useNavigate();
  const isRtl = i18n.language.startsWith("ar");

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <Link to="/solution-singles" className="w-fit">
        <Button variant="ghost" className="rounded-full font-bold text-muted-foreground hover:bg-primary/5">
          {isRtl ? <ChevronRight className="me-1 h-4 w-4" /> : <ChevronLeft className="me-1 h-4 w-4" />}
          {t("title")}
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-gray-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Lightbulb className="h-7 w-7" />
          </span>
          {t("dialog.create_title")}
        </h1>
        <p className="text-lg font-medium text-muted-foreground">{t("dialog.form_hint")}</p>
      </div>

      <SolutionSingleForm mode="create" onSaved={() => navigate("/solution-singles")} />
    </div>
  );
}
