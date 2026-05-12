/** Normalizes common Laravel / API list envelope shapes to a plain array. */
export function unwrapDataArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const inner =
      p.data ?? p.categories ?? p.items ?? p.packages ?? p.courses ?? p.results ?? p.blogs;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    if (inner && typeof inner === "object") {
      const nested = (inner as Record<string, unknown>).data;
      if (Array.isArray(nested)) return nested as Record<string, unknown>[];
    }
  }
  return [];
}

export function pickLocalized(field: unknown, lang: "ar" | "en"): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && !Array.isArray(field)) {
    const o = field as Record<string, unknown>;
    const v = o[lang];
    return typeof v === "string" ? v : "";
  }
  return "";
}

/** Parses API `slug` as `{ ar, en }` or duplicates a single string into both locales. */
export function pickBilingualSlug(raw: unknown): { ar: string; en: string } {
  if (raw == null || raw === "") return { ar: "", en: "" };
  if (typeof raw === "string") {
    const t = raw.trim();
    return { ar: t, en: t };
  }
  return {
    ar: pickLocalized(raw, "ar").trim(),
    en: pickLocalized(raw, "en").trim(),
  };
}

export function readId(record: Record<string, unknown>): string {
  const v = record.id ?? record.uuid ?? record.package_category_id ?? record.blog_category_id;
  return v != null ? String(v) : "";
}
