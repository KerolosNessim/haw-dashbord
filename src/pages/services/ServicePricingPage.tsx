import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ServicePricingServiceSelect } from "@/features/services/components/service-pricing-service-select";
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
import { Can } from "@/features/permissions/components/PermissionGate";
import { Loader2, Package, Save } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ServicePricingPage() {
  const { t } = useTranslation("translation", { keyPrefix: "services.pricing" });
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
      packages: [
        mapPackagesToPayload(packagesValues as Record<string, unknown>),
      ],
    };

    await saveServicePage({
      basic: serviceToBasicInfoValues(service),
      sections,
      serviceId: numericId,
    });
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
          <FieldLabel htmlFor="service-pricing-select">{t("select_service")}</FieldLabel>
          <ServicePricingServiceSelect
            services={services}
            value={serviceId}
            onValueChange={setServiceId}
            disabled={listLoading}
          />
          {!listLoading && services.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no_services")}</p>
          ) : null}
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
            <Can permission="service-pricing.update">
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
            </Can>
          </div>
        </div>
      )}
    </div>
  );
}
