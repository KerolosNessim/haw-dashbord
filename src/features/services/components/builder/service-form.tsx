import { useTranslation } from "react-i18next";
import SectionBuilder, { type SectionBuilderHandle } from "./section-builder";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import BasicInfoForm, { type BasicInfoFormHandle } from "./basic-info-form";
import { Loader2, Save } from "lucide-react";
import { useAdminService } from "../../hooks/useAdminService";
import { Button } from "@/components/ui/button";
import { useServicePageSave } from "../../hooks/useServicePageSave";

interface ServiceFormProps {
  initialId?: number;
}

export interface ServiceFormHandle {
  openSocialMetaDialog: () => void;
}

const ServiceForm = forwardRef<ServiceFormHandle, ServiceFormProps>(function ServiceForm(
  { initialId },
  ref,
) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form" });
  const [serviceId, setServiceId] = useState<number | null>(initialId ?? null);
  const { service, isLoading } = useAdminService(serviceId ?? undefined);
  const basicFormRef = useRef<BasicInfoFormHandle>(null);
  const sectionBuilderRef = useRef<SectionBuilderHandle>(null);
  const { saveServicePage, isPending } = useServicePageSave();

  useImperativeHandle(ref, () => ({
    openSocialMetaDialog: () => basicFormRef.current?.openSocialMetaDialog(),
  }));

  const handleSavePage = async () => {
    const basic = await basicFormRef.current?.validate();
    if (!basic) return;

    const res = await saveServicePage({
      basic,
      sections: sectionBuilderRef.current?.getSectionsPayload() ?? {},
      serviceId: serviceId ?? undefined,
    });
    const newId =
      typeof res?.data === "object" && res.data && "id" in res.data
        ? Number((res.data as { id: number }).id)
        : undefined;
    if (newId && !serviceId) {
      setServiceId(newId);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <BasicInfoForm
          ref={basicFormRef}
          embedded
          initialId={serviceId ?? undefined}
        />
      </section>

      <SectionBuilder
        ref={sectionBuilderRef}
        serviceId={serviceId ?? undefined}
        initialService={service}
        isLoading={isLoading}
      />

      <div className="flex justify-end sticky bottom-6 z-10">
        <Button
          type="button"
          size="lg"
          disabled={isPending}
          onClick={handleSavePage}
          className="h-12 rounded-full px-12 font-bold text-base gap-3 shadow-2xl shadow-primary/40"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {t("save")}
        </Button>
      </div>
    </div>
  );
});

export default ServiceForm;
