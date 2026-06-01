import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const CARD_ITEM_ICON_OPTIONS = [
  { value: "search", labelKey: "card_icon_search" },
  { value: "megaphone", labelKey: "card_icon_megaphone" },
  { value: "users", labelKey: "card_icon_users" },
  { value: "store", labelKey: "card_icon_store" },
  { value: "file-image", labelKey: "card_icon_file_image" },
  { value: "monitor-play", labelKey: "card_icon_monitor_play" },
  { value: "code-xml", labelKey: "card_icon_code_xml" },
  { value: "badge-dollar-sign", labelKey: "card_icon_badge_dollar" },
] as const;

type CardItemOptionsFieldsProps = {
  link: string;
  icon: string;
  onLinkChange: (link: string) => void;
  onIconChange: (icon: string) => void;
};

export function CardItemOptionsFields({
  link,
  icon,
  onLinkChange,
  onIconChange,
}: CardItemOptionsFieldsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "services.form.sections.fields" });

  return (
    <div className="grid gap-3 rounded-xl border border-dashed border-border/50 bg-muted/5 p-4 sm:grid-cols-2">
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
      <Field>
        <FieldLabel className="text-xs font-semibold text-muted-foreground">
          {t("card_icon_label")}
        </FieldLabel>
        <p className="mb-2 text-[10px] text-muted-foreground">{t("card_icon_hint")}</p>
        <Select
          value={icon || "__none__"}
          onValueChange={(v) => onIconChange(v === "__none__" ? "" : v)}
        >
          <SelectTrigger className="h-10 rounded-xl border-border/40 bg-white">
            <SelectValue placeholder={t("card_icon_none")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t("card_icon_none")}</SelectItem>
            {CARD_ITEM_ICON_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
