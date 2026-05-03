import CreateFaqForm from "@/features/faq/components/create-faq-form";
import { useTranslation } from "react-i18next";

function CreateFaqPage() {
  const { t } = useTranslation("translation", { keyPrefix: "faq" });

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t("add_faq")}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{t("description")}</p>
        </div>
      </div>

      <CreateFaqForm />
    </div>
  );
}

export default CreateFaqPage;