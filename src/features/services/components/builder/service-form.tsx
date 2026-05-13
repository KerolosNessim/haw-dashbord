import { useTranslation } from "react-i18next";
import SectionBuilder from "./section-builder";
import { useState } from "react";
import BasicInfoForm from "./basic-info-form";
import { Layout } from "lucide-react";
import { useAdminService } from "../../hooks/useAdminService";

interface ServiceFormProps {
  initialId?: number;
}

// Edit mode: Both form and sections are shown side by side and fully editable from the start.
// Create mode: Sections are locked until the Basic Info form is saved (serviceId is obtained).
export default function ServiceForm({ initialId }: ServiceFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const isEditMode = !!initialId;

  const [serviceId, setServiceId] = useState<number | null>(initialId || null);
  const { service, isLoading } = useAdminService(serviceId ?? undefined);

  const handleBasicInfoSuccess = (id: number) => {
    setServiceId(id);
  };

  return (
    <div className="space-y-8">
      {/* Part 1: Basic Info Form — Always editable */}
      <section>
        <BasicInfoForm
          onSuccess={handleBasicInfoSuccess}
          initialId={serviceId ?? undefined}
        />
      </section>

      {/* Part 2: Section Builder */}
      {serviceId ? (
        <SectionBuilder
          serviceId={serviceId}
          initialService={service}
          isLoading={isLoading}
        />
      ) : (
        // Only shown on create mode before first save
        !isEditMode && (
          <div className="p-12 border-2 border-dashed rounded-[32px] bg-muted/5 flex flex-col items-center justify-center text-muted-foreground">
            <Layout className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold opacity-40">{t("save_first")}</p>
          </div>
        )
      )}
    </div>
  );
}
