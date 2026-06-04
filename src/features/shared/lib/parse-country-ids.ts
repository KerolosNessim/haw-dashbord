import type { Country } from "@/features/countries/types";

/** Normalizes API country links to string IDs for forms (`country_ids`). */
export function parseCountryIdsFromApi(raw: unknown): string[] {
  if (raw == null || typeof raw !== "object") {
    if (typeof raw === "number" && raw > 0) return [String(raw)];
    return [];
  }

  const row = raw as Record<string, unknown>;

  if (Array.isArray(row.country_ids)) {
    return row.country_ids
      .map((id) => String(id))
      .filter((id) => id !== "" && id !== "0");
  }

  if (Array.isArray(row.countries)) {
    return (row.countries as unknown[])
      .map((c) => {
        if (c && typeof c === "object" && "id" in (c as object)) {
          return String((c as { id: unknown }).id);
        }
        return "";
      })
      .filter((id) => id !== "" && id !== "0");
  }

  if (row.country_id != null && row.country_id !== "") {
    return [String(row.country_id)];
  }

  return [];
}

export function countryIdsToNumbers(ids: string[] | undefined): number[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function formatCountryLabels(
  ids: string[],
  countries: Country[],
  lang: "ar" | "en",
): string {
  if (!ids.length) return "";
  return ids
    .map((id) => {
      const c = countries.find((x) => String(x.id) === id);
      if (!c) return id;
      return lang === "ar" ? c.name.ar : c.name.en;
    })
    .join(", ");
}
