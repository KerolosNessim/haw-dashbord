import { useResourcePermissions } from "@/features/permissions/hooks/useResourcePermissions";
import { useTranslation } from "react-i18next";
import SectionBuilder, {
  type SectionBuilderHandle,
  type SectionType,
} from "./section-builder";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import BasicInfoForm, {
  type BasicInfoFormHandle,
  type BasicInfoValues,
} from "./basic-info-form";
import { Loader2, Save } from "lucide-react";
import { useAdminService } from "../../hooks/useAdminService";
import { Button } from "@/components/ui/button";
import { useServicePageSave } from "../../hooks/useServicePageSave";
import { useServiceFormDraft } from "../../hooks/useServiceFormDraft";

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
  const servicesPerms = useResourcePermissions("services");
  const canSave = serviceId ? servicesPerms.update : servicesPerms.create;
  const { queueSave, clearServiceDraft } = useServiceFormDraft(serviceId);
  const basicDraftRef = useRef<{
    basic: BasicInfoValues;
    coverPreviewAr: string | null;
    coverPreviewEn: string | null;
  } | null>(null);
  const sectionsDraftRef = useRef<{
    sections: Array<{ id: string; type: SectionType; data?: Record<string, unknown> }>;
    sectionDataById: Record<string, Record<string, unknown>>;
  } | null>(null);

  const flushDraftSave = useCallback(() => {
    const basic = basicDraftRef.current;
    if (!basic) return;
    const sections = sectionsDraftRef.current;
    queueSave({
      basic: basic.basic,
      coverPreviewAr: basic.coverPreviewAr,
      coverPreviewEn: basic.coverPreviewEn,
      sections: sections?.sections ?? [],
      sectionDataById: sections?.sectionDataById ?? {},
    });
  }, [queueSave]);

  const handleBasicDraftChange = useCallback(
    (payload: {
      basic: BasicInfoValues;
      coverPreviewAr: string | null;
      coverPreviewEn: string | null;
    }) => {
      basicDraftRef.current = payload;
      flushDraftSave();
    },
    [flushDraftSave],
  );

  const handleSectionsDraftChange = useCallback(
    (payload: {
      sections: Array<{ id: string; type: SectionType; data?: Record<string, unknown> }>;
      sectionDataById: Record<string, Record<string, unknown>>;
    }) => {
      sectionsDraftRef.current = payload;
      flushDraftSave();
    },
    [flushDraftSave],
  );

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
    clearServiceDraft();
  };

  return (
    <div className="space-y-8">
      <section>
        <BasicInfoForm
          ref={basicFormRef}
          embedded
          initialId={serviceId ?? undefined}
          onBasicDraftChange={handleBasicDraftChange}
        />
      </section>

      <SectionBuilder
        ref={sectionBuilderRef}
        serviceId={serviceId ?? undefined}
        initialService={service}
        isLoading={isLoading}
        onSectionsDraftChange={handleSectionsDraftChange}
      />

      {canSave ? (
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
      ) : null}
    </div>
  );
});

export default ServiceForm;
