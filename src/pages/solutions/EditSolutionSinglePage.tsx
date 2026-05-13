import { Button } from "@/components/ui/button";
import SolutionSingleForm from "@/features/solutions/components/solution-single-form";
import { useSolutionSingleDetail } from "@/features/solutions/hooks/useSolutionSingleDetail";
import type { SolutionFeature } from "@/features/solutions/types";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

type LocationState = {
  row?: SolutionFeature;
};

export default function EditSolutionSinglePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const routeState = location.state as LocationState | null;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("translation", { keyPrefix: "solutions" });
  const isRtl = i18n.language.startsWith("ar");
  const { data, isLoading, isError } = useSolutionSingleDetail(id);
  const initial = data ?? routeState?.row ?? null;

  useEffect(() => {
    console.log("[EditSolutionSinglePage] solution single edit data:", {
      id,
      fetchedDetail: data,
      routeStateRow: routeState?.row ?? null,
      initial,
      isLoading,
      isError,
    });
  }, [id, data, routeState?.row, initial, isLoading, isError]);

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
          {t("dialog.edit_title")}
        </h1>
        <p className="text-lg font-medium text-muted-foreground">{t("dialog.form_hint")}</p>
      </div>

      {isLoading && !initial ? (
        <div className="rounded-[32px] border bg-white p-12 text-center text-muted-foreground">...</div>
      ) : null}
      {isError || (!isLoading && !initial) ? (
        <p className="text-sm text-destructive">{t("api.load_error")}</p>
      ) : null}
      {initial ? (
        <SolutionSingleForm mode="edit" initial={initial} onSaved={() => navigate("/solution-singles")} />
      ) : null}
    </div>
  );
}
