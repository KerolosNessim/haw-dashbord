import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Service } from "@/features/services/type";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type ServicePricingServiceSelectProps = {
  services: Service[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

function serviceTitle(service: Service, isRtl: boolean): string {
  const ar = plainTextFromHtml(service.title?.ar);
  const en = plainTextFromHtml(service.title?.en);
  const slugAr = plainTextFromHtml(
    typeof service.slug === "string" ? service.slug : service.slug?.ar,
  );
  const slugEn = plainTextFromHtml(
    typeof service.slug === "string" ? service.slug : service.slug?.en,
  );
  const label = (isRtl ? ar || en : en || ar) || (isRtl ? slugAr || slugEn : slugEn || slugAr);
  return label || String(service.id);
}

export function ServicePricingServiceSelect({
  services,
  value,
  onValueChange,
  disabled,
  id = "service-pricing-select",
}: ServicePricingServiceSelectProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "services.pricing" });
  const isRtl = i18n.language.startsWith("ar");

  const options = useMemo(
    () =>
      services
        .filter((s) => s.id != null && Number.isFinite(Number(s.id)))
        .map((s) => ({
          value: String(s.id),
          label: serviceTitle(s, isRtl),
        })),
    [services, isRtl],
  );

  return (
    <Select
      value={value.trim() ? value : undefined}
      onValueChange={onValueChange}
      disabled={disabled || options.length === 0}
    >
      <SelectTrigger
        id={id}
        dir={isRtl ? "rtl" : "ltr"}
        className="h-12 w-full max-w-md rounded-xl bg-background"
      >
        <SelectValue placeholder={t("select_placeholder")} />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="rounded-xl">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            textValue={opt.label}
            className="max-w-[min(100vw-2rem,28rem)]"
          >
            <span className="line-clamp-2 text-start">{opt.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
