import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { invoiceDisplayText } from "../utils/invoice-display-text";
import type { InvoiceCatalogOption, InvoiceCatalogType } from "../types";

type Props = {
  type: InvoiceCatalogType;
  label: string;
  placeholder: string;
  options: InvoiceCatalogOption[];
  value: string[];
  onChange: (keys: string[]) => void;
  lineCosts: Record<string, number>;
  onLineCostChange: (key: string, cost: number) => void;
  isLoading?: boolean;
};

export default function InvoiceCatalogPicker({
  type,
  label,
  placeholder,
  options,
  value,
  onChange,
  lineCosts,
  onLineCostChange,
  isLoading,
}: Props) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "invoices.form" });
  const isAr = i18n.language.startsWith("ar");

  const typeOptions = useMemo(
    () => options.filter((o) => o.type === type),
    [options, type],
  );

  const labelForKey = (key: string) => {
    const opt = typeOptions.find((o) => o.key === key);
    if (!opt) return key;
    return invoiceDisplayText(isAr ? opt.labelAr : opt.labelEn);
  };

  const optionLabel = (opt: InvoiceCatalogOption) =>
    invoiceDisplayText(isAr ? opt.labelAr : opt.labelEn);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {isLoading ? (
        <div className="flex h-12 items-center gap-2 rounded-2xl border border-dashed px-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          <Combobox value={value} onValueChange={onChange} multiple>
            <ComboboxChips className="min-h-12 rounded-2xl border-border/50 bg-background p-2">
              {value.map((key) => (
                <ComboboxChip key={key} value={key}>
                  {labelForKey(key)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={value.length === 0 ? placeholder : ""}
                className="border-none bg-transparent focus:ring-0"
              />
            </ComboboxChips>
            <ComboboxContent className="w-[--anchor-width]">
              <ComboboxList>
                {typeOptions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">—</div>
                ) : (
                  typeOptions.map((opt) => (
                    <ComboboxItem key={opt.key} value={opt.key}>
                      {optionLabel(opt)}
                      <span className="ms-2 text-xs text-muted-foreground" dir="ltr">
                        {opt.price.toFixed(2)} {opt.currency}
                      </span>
                    </ComboboxItem>
                  ))
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {value.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {value.map((key) => {
                const opt = typeOptions.find((o) => o.key === key);
                const currency = opt?.currency ?? "SAR";
                const catalogPrice = opt?.price ?? 0;
                const currentCost = lineCosts[key] ?? catalogPrice;

                return (
                  <li
                    key={key}
                    className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-3 sm:flex-row sm:items-center"
                  >
                    <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                      {labelForKey(key)}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {t("line_price")}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        dir="ltr"
                        className="h-10 w-28 rounded-lg"
                        value={Number.isFinite(currentCost) ? currentCost : 0}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          onLineCostChange(key, Number.isFinite(n) && n >= 0 ? n : 0);
                        }}
                      />
                      <span className="text-xs font-medium text-muted-foreground" dir="ltr">
                        {currency}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      )}
    </Field>
  );
}
