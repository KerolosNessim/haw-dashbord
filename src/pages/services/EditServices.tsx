import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import ServiceForm, {
  type ServiceFormHandle,
} from "@/features/services/components/builder/service-form";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function EditServicesPage() {
  const { id } = useParams();
  const { t } = useTranslation("translation", { keyPrefix: "services" });
  const { t: tf } = useTranslation("translation", { keyPrefix: "services.form" });
  const serviceFormRef = useRef<ServiceFormHandle>(null);

  return (
    <div className="flex-1 space-y-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-start text-3xl font-bold tracking-tight">{t("edit_service")}</h1>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 gap-2 rounded-full px-5 font-bold shadow-sm"
          onClick={() => serviceFormRef.current?.openSocialMetaDialog()}
        >
          <Share2 className="h-4 w-4" />
          {tf("social_meta_button")}
        </Button>
      </div>

      <ServiceForm ref={serviceFormRef} initialId={id ? Number(id) : undefined} />
    </div>
  );
}
