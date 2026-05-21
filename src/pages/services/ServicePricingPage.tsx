import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import ServicePackagesForm, {
  type ServicePackagesFormHandle,
} from "@/features/services/components/service-packages-form";
import { useAdminService } from "@/features/services/hooks/useAdminService";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import { useServicePageSave } from "@/features/services/hooks/useServicePageSave";
import {
  packagesDataFromService,
  serviceToBasicInfoValues,
  serviceToSectionsPayload,
} from "@/features/services/utils/service-api-mappers";
import { mapPackagesToPayload } from "@/features/services/utils/section-form-mappers";
import { Loader2, Package, Save } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ServicePricingPage() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services.pricing" });
  const { data: servicesList, isLoading: listLoading } = useGetServices();
  const [serviceId, setServiceId] = useState<string>("");
  const numericId = serviceId ? Number(serviceId) : undefined;
  const { service, isLoading: serviceLoading } = useAdminService(numericId);
  const packagesFormRef = useRef<ServicePackagesFormHandle>(null);
  const { saveServicePage, isPending } = useServicePageSave();

  const services = servicesList?.data?.data ?? [];

  const handleSave = async () => {
    if (!service || !numericId) return;
    const packagesValues = await packagesFormRef.current?.validate();
    if (!packagesValues) return;

    const sections = {
      ...serviceToSectionsPayload(service),
      packages: mapPackagesToPayload(packagesValues as Record<string, unknown>),
    };

    await saveServicePage({
      basic: serviceToBasicInfoValues(service),
      sections,
      serviceId: numericId,
    });
  };

  const serviceLabel = (id: number) => {
    const found = services.find((s) => s.id === id);
    if (!found) return String(id);
    return i18n.language.startsWith("ar")
      ? found.title?.ar || found.title?.en
      : found.title?.en || found.title?.ar;
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-20">
      <div className="flex flex-col gap-4 border-b pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border bg-card p-6 shadow-sm">
        <Field>
          <FieldLabel>{t("select_service")}</FieldLabel>
          <Select value={serviceId} onValueChange={setServiceId} disabled={listLoading}>
            <SelectTrigger className="h-12 w-full max-w-md rounded-xl">
              <SelectValue placeholder={t("select_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {serviceLabel(s.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {!serviceId && (
        <p className="text-center text-muted-foreground opacity-60">{t("empty_select")}</p>
      )}

      {serviceId && serviceLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {service && !serviceLoading && (
        <div className="space-y-8">
          <ServicePackagesForm
            key={service.id}
            ref={packagesFormRef}
            initialData={packagesDataFromService(service)}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="lg"
              disabled={isPending}
              onClick={handleSave}
              className="h-12 gap-2 rounded-full px-12 font-bold shadow-lg"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {t("save")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
