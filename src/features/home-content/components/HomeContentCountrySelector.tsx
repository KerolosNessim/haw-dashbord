import { Globe, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useHomeContentCountry } from "../context/home-content-country-context";
import { countryFlagEmoji } from "@/features/countries/lib/country-flag";

/**
 * Country scope selector — single mode for per-country home sections,
 * multi mode for resources that can appear in several countries.
 */
export default function HomeContentCountrySelector() {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "home_content" });
  const {
    mode,
    countries,
    countryId,
    countryIds,
    toggleCountryId,
    isLoadingCountries,
    isCountryReady,
  } = useHomeContentCountry();

  const lang = i18n.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  const isMulti = mode === "multi";

  if (isLoadingCountries) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-white px-6 py-4 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("country_loading")}
        </span>
      </div>
    );
  }

  if (!countries.length) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm font-medium text-amber-900">
        {t("country_empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-bold text-gray-900">
            {isMulti ? t("countries_filter_label") : t("country_label")}
          </p>
          <p className="text-xs text-muted-foreground">
            {isMulti ? t("countries_filter_hint") : t("country_hint")}
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={isMulti ? t("countries_filter_label") : t("country_label")}
      >
        {countries.map((country) => {
          const isActive = isMulti
            ? countryIds.includes(country.id)
            : countryId === country.id;
          const label = lang === "ar" ? country.name.ar : country.name.en;

          return (
            <button
              key={country.id}
              type="button"
              onClick={() => toggleCountryId(country.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all",
                isActive
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-gray-100 bg-gray-50 text-gray-700 hover:border-primary/40",
              )}
              aria-pressed={isActive}
            >
              {country.image ? (
                <img
                  src={country.image}
                  alt=""
                  className="h-6 w-6 rounded-md object-cover"
                />
              ) : (
                <span className="text-lg leading-none" aria-hidden>
                  {countryFlagEmoji(country)}
                </span>
              )}
              {label}
            </button>
          );
        })}
      </div>

      {isMulti && countryIds.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          {t("countries_filter_selected", { count: countryIds.length })}
        </p>
      ) : null}

      {!isCountryReady ? (
        <p className="text-xs font-medium text-amber-700">{t("country_select_required")}</p>
      ) : null}
    </div>
  );
}
