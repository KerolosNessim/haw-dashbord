import { Button } from "@/components/ui/button";
import ServiceCard from "@/features/services/components/services-card";
import { useGetServices } from "@/features/services/hooks/useGetServices";
import Loader from "@/features/shared/components/loader";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";



export default function ServicesPage() {
  const { t } = useTranslation("translation", { keyPrefix: "services" });
  const { data, isLoading } = useGetServices()
  const services = data?.data ?? []

  if(isLoading) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild size="lg">
          <Link to="/services/create" className="flex items-center gap-2">
            <Plus />
            {t("add_service")}
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
          />
        ))}
      </div>
    </div>
  );
}
