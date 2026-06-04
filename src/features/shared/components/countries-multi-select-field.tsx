import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useActiveUniqueCountries } from "@/features/countries/hooks/useCountries";
import { countryFlagEmoji } from "@/features/countries/lib/country-flag";
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
 * Multi-select countries (same UX as services `country_ids`).
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

  return (
    <Field>
      <FieldLabel>
        {label ?? t("countries_field_label")}
        {required ? " *" : null}
      </FieldLabel>
      {hint ? <p className="text-xs text-muted-foreground mb-2">{hint}</p> : null}
      <Combobox
        value={value}
        onValueChange={onChange}
        multiple
        disabled={disabled || isLoading || !countries.length}
      >
        <ComboboxChips className="min-h-12 rounded-2xl border-border/50 bg-background p-2">
          {value.map((val) => {
            const country = countries.find((c) => String(c.id) === val);
            const name = country
              ? lang === "ar"
                ? country.name.ar
                : country.name.en
              : val;
            return (
              <ComboboxChip key={val} value={val}>
                {country?.image ? (
                  <img src={country.image} alt="" className="mr-1 h-4 w-4 rounded object-cover" />
                ) : country ? (
                  <span className="mr-1 text-sm leading-none" aria-hidden>
                    {countryFlagEmoji(country)}
                  </span>
                ) : null}
                {name}
              </ComboboxChip>
            );
          })}
          <ComboboxChipsInput
            placeholder={value.length === 0 ? t("countries_field_placeholder") : ""}
            className="border-none bg-transparent focus:ring-0"
          />
        </ComboboxChips>
        <ComboboxContent className="w-[--anchor-width]">
          <ComboboxList>
            {countries.map((country) => (
              <ComboboxItem key={country.id} value={String(country.id)}>
                <span className="inline-flex items-center gap-2">
                  {country.image ? (
                    <img
                      src={country.image}
                      alt=""
                      className="h-5 w-5 rounded object-cover"
                    />
                  ) : (
                    <span className="text-base leading-none" aria-hidden>
                      {countryFlagEmoji(country)}
                    </span>
                  )}
                  {lang === "ar" ? country.name.ar : country.name.en}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}
