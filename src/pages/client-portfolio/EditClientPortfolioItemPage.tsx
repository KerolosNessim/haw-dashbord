import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PortfolioItemForm from "@/features/client-portfolio/components/PortfolioItemForm";
import { useClientPortfolioItems } from "@/features/client-portfolio/hooks/useClientPortfolioItems";
import type { PortfolioItemFormValues } from "@/features/client-portfolio/types";
import { Can } from "@/features/permissions/components/PermissionGate";

const LIST_URL = "/client-portfolio?tab=items";

export default function EditClientPortfolioItemPage() {
  const { id } = useParams();
  const itemId = Number(id);
  const { t, i18n } = useTranslation("translation", { keyPrefix: "client_portfolio.items" });
  const navigate = useNavigate();
  const isRtl = i18n.language.startsWith("ar");
  const { fetchItem, updateItemAsync, isUpdating, updateError, resetUpdateError } =
    useClientPortfolioItems();

  const itemQuery = useQuery({
    queryKey: ["client-portfolio", "items", itemId],
    queryFn: () => fetchItem(itemId),
    enabled: Number.isFinite(itemId) && itemId > 0,
  });

  if (itemQuery.isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!itemQuery.data) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-muted-foreground">{t("not_found")}</p>
        <Button asChild variant="outline" className="rounded-xl font-bold">
          <Link to={LIST_URL}>{t("back_to_list")}</Link>
        </Button>
      </div>
    );
  }

  const item = itemQuery.data;

  const handleSave = async (values: PortfolioItemFormValues) => {
    resetUpdateError();
    try {
      await updateItemAsync({ id: item.id, values });
      navigate(LIST_URL);
    } catch {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Can permission="home-content.update" fallback={null}>
      <div className="mx-auto max-w-[80%] space-y-8 pb-20">
        <Link to={LIST_URL} className="w-fit">
          <Button
            variant="ghost"
            className="group rounded-full ps-2 pe-4 font-bold text-muted-foreground hover:bg-primary/5"
          >
            {isRtl ? (
              <ChevronRight className="me-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ChevronLeft className="me-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            )}
            {t("back_to_list")}
          </Button>
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t("edit_title")}</h1>
            <p className="mt-1 font-medium text-muted-foreground">{t("dialog_description")}</p>
          </div>
        </div>

        <div className="rounded-[32px] border bg-muted/20 p-6 shadow-sm md:p-8">
          <PortfolioItemForm
            key={item.id}
            item={item}
            isSaving={isUpdating}
            saveError={updateError}
            onCancel={() => navigate(LIST_URL)}
            onSave={handleSave}
          />
        </div>
      </div>
    </Can>
  );
}
