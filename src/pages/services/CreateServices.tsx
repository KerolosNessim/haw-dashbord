import { useTranslation } from "react-i18next";
import ServiceForm from "@/features/services/components/builder/service-form";

export default function CreateServicesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "services" });
  return (
    <div className="flex-1 space-y-8 ">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("add_service")}</h1>
      </div>

      <ServiceForm />
    </div>
  );
}
