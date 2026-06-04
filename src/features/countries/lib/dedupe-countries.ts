import type { Country } from "@/features/countries/types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

/** Group duplicates by Arabic name; fall back to English when Arabic is missing. */
export function normalizeCountryNameKey(name: Country["name"]): string {
  const ar = normalizeText(name.ar.trim());
  const en = normalizeText(name.en.trim());
  return ar || en;
}

function preferCountry(a: Country, b: Country): Country {
  const aHasImage = Boolean(a.image?.trim());
  const bHasImage = Boolean(b.image?.trim());
  if (aHasImage && !bHasImage) return a;
  if (bHasImage && !aHasImage) return b;
  return a.id <= b.id ? a : b;
}

/** Map duplicate country ids to the canonical record kept in selectors. */
export function buildCountryIdAliasMap(countries: Country[]): Map<number, number> {
  const groups = new Map<string, Country[]>();

  for (const country of countries) {
    const key = normalizeCountryNameKey(country.name);
    const list = groups.get(key) ?? [];
    list.push(country);
    groups.set(key, list);
  }

  const alias = new Map<number, number>();
  for (const group of groups.values()) {
    const canonical = group.reduce(preferCountry);
    for (const country of group) {
      alias.set(country.id, canonical.id);
    }
  }

  return alias;
}

export function dedupeCountries(countries: Country[]): Country[] {
  const byKey = new Map<string, Country>();

  for (const country of countries) {
    const key = normalizeCountryNameKey(country.name);
    const existing = byKey.get(key);
    byKey.set(key, existing ? preferCountry(existing, country) : country);
  }

  return Array.from(byKey.values()).sort((a, b) => a.id - b.id);
}

export function remapCountryIds(
  ids: number[],
  alias: Map<number, number>,
): number[] {
  return [...new Set(ids.map((id) => alias.get(id) ?? id).filter((id) => id > 0))];
}
