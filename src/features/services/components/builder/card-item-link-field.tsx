import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type CardItemLinkFieldProps = {
  link: string;
  onLinkChange: (link: string) => void;
};

/** Optional per-item URL (cards, FAQ rows, packages, audits). */
export function CardItemLinkField({ link, onLinkChange }: CardItemLinkFieldProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form.sections.fields" });

  return (
    <Field>
      <FieldLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        {t("card_link_label")}
      </FieldLabel>
      <p className="mb-2 text-[10px] text-muted-foreground">{t("card_link_hint")}</p>
      <Input
        type="url"
        value={link}
        onChange={(e) => onLinkChange(e.target.value)}
        placeholder={t("card_link_placeholder")}
        className="h-10 rounded-xl border-border/40 bg-white"
      />
    </Field>
  );
}
