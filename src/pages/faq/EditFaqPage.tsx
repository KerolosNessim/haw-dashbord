import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useFaqGeneral } from "@/features/faq/hooks/useFaqGeneral";
import CreateFaqForm from "@/features/faq/components/create-faq-form";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditFaqPage() {
  const { t } = useTranslation("translation", { keyPrefix: "faq.form" });
  const { id } = useParams();
  const navigate = useNavigate();
  const { getGeneralQuery } = useFaqGeneral();
  const { data: faqData, isLoading } = getGeneralQuery;

  const faqItem = faqData?.data?.items.find((item) => item.id === Number(id));

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!faqItem && !isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-muted-foreground">
          FAQ Item not found
        </h2>
        <Button onClick={() => navigate("/faq")}>Back to FAQ</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto pb-10">
      {/* header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/faq")}
          className="rounded-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("edit_question")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("edit_description")}</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-border/60 p-8 md:p-12 shadow-2xl shadow-gray-200/50">
        <CreateFaqForm editData={faqItem} onSuccess={() => navigate("/faq")} />
      </div>
    </div>
  );
}
