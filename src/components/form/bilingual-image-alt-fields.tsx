"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type BilingualImageAltFieldsProps = {
  value: BilingualImageAlt;
  onChange: (value: BilingualImageAlt) => void;
  /** i18n key prefix, e.g. `services.form` → `services.form.image_alt_ar` */
  keyPrefix?: string;
  /** Translation keys under keyPrefix (defaults: image_alt_ar / image_alt_en). */
  arLabelKey?: string;
  enLabelKey?: string;
  placeholderKey?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * AR/EN alt text inputs shown below image pickers (accessibility).
 */
export function BilingualImageAltFields({
  value,
  onChange,
  keyPrefix = "services.form",
  arLabelKey = "image_alt_ar",
  enLabelKey = "image_alt_en",
  placeholderKey = "image_alt_placeholder",
  className,
  disabled = false,
}: BilingualImageAltFieldsProps) {
  const { t } = useTranslation("translation", { keyPrefix });

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      <Field>
        <FieldLabel className="text-sm font-bold">{t(arLabelKey)}</FieldLabel>
        <Input
          value={value.ar}
          onChange={(e) => onChange({ ...value, ar: e.target.value })}
          placeholder={t(placeholderKey, { defaultValue: t("placeholders.image_alt", { defaultValue: "" }) })}
          dir="rtl"
          disabled={disabled}
          className="rounded-xl"
        />
      </Field>
      <Field>
        <FieldLabel className="text-sm font-bold">{t(enLabelKey)}</FieldLabel>
        <Input
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder={t(placeholderKey, { defaultValue: t("placeholders.image_alt", { defaultValue: "" }) })}
          dir="ltr"
          disabled={disabled}
          className="rounded-xl"
        />
      </Field>
    </div>
  );
}
