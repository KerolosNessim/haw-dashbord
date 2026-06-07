import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useActiveUniqueCountries } from "@/features/countries/hooks/useCountries";
import { countryFlagEmoji } from "@/features/countries/lib/country-flag";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
};

/**
 * Multi-select countries via toggle chips (works inside dialogs; one or more).
 */
export default function CountriesMultiSelectField({
  value,
  onChange,
  label,
  hint,
  error,
  disabled,
  required,
}: Props) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "home_content" });
  const { countries, isLoading } = useActiveUniqueCountries();
  const lang = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";

  const selectedIds = useMemo(
    () => [...new Set((value ?? []).map((id) => String(id)).filter(Boolean))],
    [value],
  );

  const isDisabled = disabled || isLoading || !countries.length;

  const toggleCountry = (id: string) => {
    if (isDisabled) return;
    const has = selectedIds.includes(id);
    if (has) {
      const next = selectedIds.filter((row) => row !== id);
      onChange(next);
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <Field>
      <FieldLabel>
        {label ?? t("countries_field_label")}
        {required ? " *" : null}
      </FieldLabel>
      {hint ? <p className="mb-2 text-xs text-muted-foreground">{hint}</p> : null}

      {isLoading ? (
        <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-border/50 bg-background px-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("country_loading")}
        </div>
      ) : !countries.length ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("country_empty")}
        </p>
      ) : (
        <div
          className={cn(
            "flex min-h-12 flex-wrap gap-2 rounded-2xl border border-border/50 bg-background p-2",
            isDisabled && "pointer-events-none opacity-60",
          )}
          role="group"
          aria-label={label ?? t("countries_field_label")}
        >
          {countries.map((country) => {
            const id = String(country.id);
            const isActive = selectedIds.includes(id);
            const name = lang === "ar" ? country.name.ar : country.name.en;

            return (
              <button
                key={country.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleCountry(id)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-primary/40",
                )}
              >
                {country.image ? (
                  <img src={country.image} alt="" className="h-5 w-5 rounded object-cover" />
                ) : (
                  <span className="text-base leading-none" aria-hidden>
                    {countryFlagEmoji(country)}
                  </span>
                )}
                {name}
              </button>
            );
          })}
        </div>
      )}

      {selectedIds.length > 1 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("countries_filter_selected", { count: selectedIds.length })}
        </p>
      ) : null}

      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}
