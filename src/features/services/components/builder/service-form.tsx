import { useTranslation } from "react-i18next";
import SectionBuilder from "./section-builder";
import { useState } from "react";
import BasicInfoForm from "./basic-info-form";
import { Layout } from "lucide-react";

export default function ServiceForm() {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [serviceId, setServiceId] = useState<number | null>(null);

  const handleBasicInfoSuccess = (id:number ) => {
    setServiceId(id);
  };

  return (
    <div className="space-y-6">
      {/* Part 1: Standalone Basic Info Form */}
      <section className={serviceId ? "opacity-60 pointer-events-none transition-opacity scale-[0.98] origin-top" : "transition-all duration-500"}>
        <BasicInfoForm onSuccess={handleBasicInfoSuccess}  />
      </section>

      {/* Part 2: Section Builder (Unlocks after Part 1 is saved) */}
      {serviceId ? (
        <SectionBuilder serviceId={serviceId} />
      ) : (
        <div className="p-12 border-2 border-dashed rounded-[32px] bg-muted/5 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
           <Layout className="w-12 h-12 mb-4 opacity-20" />
           <p className="font-bold opacity-40">{t("save_first")}</p>
        </div>
      )}
    </div>
  );
}
