import { BriefcaseBusiness, ChevronDown, X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  linkedServicePlainTitle,
  resolveLinkedServiceLabels,
} from "../services/accreditation-form-data";
import type { AccreditationLinkedService } from "../types";
import type { Service } from "@/features/services/type";
import { cn } from "@/lib/utils";

type Props = {
  value: number[];
  onChange: (ids: number[]) => void;
  services: Service[];
  /** Titles from GET accreditations `images[].services` when catalog is still loading. */
  embeddedServices?: AccreditationLinkedService[];
  /** i18n key prefix under `translation`, default `home_content.dependencies`. */
  i18nKeyPrefix?: string;
  disabled?: boolean;
  loading?: boolean;
};

function catalogLabel(service: Service, lang: "ar" | "en"): string {
  return linkedServicePlainTitle(service.title, lang) || `#${service.id}`;
}

export function AccreditationImageServicesSelect({
  value,
  onChange,
  services,
  embeddedServices,
  i18nKeyPrefix = "home_content.dependencies",
  disabled,
  loading,
}: Props) {
  const { t, i18n } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });
  const lang = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";

  const selected = useMemo(
    () => resolveLinkedServiceLabels(value, services, embeddedServices, lang),
    [value, services, embeddedServices, lang],
  );

  const toggle = (serviceId: number, checked: boolean) => {
    if (checked) {
      onChange(value.includes(serviceId) ? value : [...value, serviceId]);
      return;
    }
    onChange(value.filter((id) => id !== serviceId));
  };

  const removeOne = (serviceId: number) => {
    onChange(value.filter((id) => id !== serviceId));
  };

  const triggerLabel = loading
    ? t("linked_services_loading")
    : value.length > 0
      ? t("linked_services_edit")
      : t("linked_services_placeholder");

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <BriefcaseBusiness className="h-3 w-3" />
        {t("linked_services")}
      </label>

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <li key={item.id}>
              <Badge
                variant="secondary"
                className="max-w-full gap-1 py-1 pe-1 ps-2 text-[10px] font-medium leading-snug"
              >
                <span className="truncate" title={item.label}>
                  {item.label}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeOne(item.id)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:opacity-50"
                  aria-label={t("linked_services_remove")}
                >
                  <X className="h-3 w-3 shrink-0" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[10px] text-muted-foreground">{t("linked_services_none")}</p>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || loading}
            className={cn(
              "h-9 w-full justify-between rounded-lg px-3 text-xs font-medium",
              !value.length && "text-muted-foreground",
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] max-h-56 overflow-y-auto p-2"
        >
          {services.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              {t("linked_services_empty")}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {services.map((service) => (
                <li key={service.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                    <Checkbox
                      checked={value.includes(service.id)}
                      onCheckedChange={(checked) => toggle(service.id, checked === true)}
                      className="mt-0.5"
                    />
                    <span className="text-xs leading-snug">{catalogLabel(service, lang)}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
      <p className="text-[9px] text-muted-foreground">{t("linked_services_hint")}</p>
    </div>
  );
}
