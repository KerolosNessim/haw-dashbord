import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useActiveUniqueCountries } from "@/features/countries/hooks/useCountries";
import { countryFlagEmoji } from "@/features/countries/lib/country-flag";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CONTACT_HEADER_SUPPORTED_COUNTRY_IDS } from "../constants";

type Props = {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
};

/** Country picker limited to Oman (1) and Saudi Arabia (4). */
export default function ContactHeaderCountriesField({
  value,
  onChange,
  label,
  hint,
  error,
  disabled,
  required,
}: Props) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "contact_headers.form" });
  const { countries, isLoading } = useActiveUniqueCountries();
  const lang = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";

  const supportedSet = useMemo(
    () => new Set(CONTACT_HEADER_SUPPORTED_COUNTRY_IDS.map(String)),
    [],
  );

  const allowedCountries = useMemo(
    () => countries.filter((c) => supportedSet.has(String(c.id))),
    [countries, supportedSet],
  );

  const selectedIds = useMemo(
    () => [...new Set((value ?? []).map(String).filter((id) => supportedSet.has(id)))],
    [value, supportedSet],
  );

  const isDisabled = disabled || isLoading || !allowedCountries.length;

  const toggleCountry = (id: string) => {
    if (isDisabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((row) => row !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <Field>
      <FieldLabel>
        {label ?? t("countries")}
        {required ? " *" : null}
      </FieldLabel>
      {hint ? <p className="mb-2 text-xs text-muted-foreground">{hint}</p> : null}

      {isLoading ? (
        <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-border/50 bg-background px-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("countries_loading")}
        </div>
      ) : !allowedCountries.length ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("countries_empty")}
        </p>
      ) : (
        <div
          className={cn(
            "flex min-h-14 flex-wrap gap-3 rounded-2xl border border-border/50 bg-background p-3",
            isDisabled && "pointer-events-none opacity-60",
          )}
        >
          {allowedCountries.map((country) => {
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
                  "inline-flex items-center gap-2.5 rounded-2xl border-2 px-4 py-2.5 text-sm font-bold transition-all",
                  isActive
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                    : "border-border/60 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5",
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

      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}
