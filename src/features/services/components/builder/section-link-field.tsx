import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type SectionLinkFieldProps = {
  value: string;
  onChange: (link: string) => void;
};

export function SectionLinkField({ value, onChange }: SectionLinkFieldProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form.sections" });

  return (
    <Field className="mb-4 rounded-xl border border-dashed border-border/60 bg-muted/5 px-4 py-3">
      <FieldLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        {t("section_link_label")}
      </FieldLabel>
      <p className="mb-2 text-[10px] text-muted-foreground">{t("section_link_hint")}</p>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("section_link_placeholder")}
        className="h-10 rounded-xl border-border/40 bg-white"
      />
    </Field>
  );
}
