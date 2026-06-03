/** Laravel ApiResponse: HTTP 200 with `{ status: "false", ... }` is a failure. */
export function assertApiEnvelopeSuccess(data: unknown): void {
  if (data == null || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const s = d.status;
  if (s === false || s === "false" || s === 0 || s === "0") {
    const msg =
      typeof d.message === "string" && d.message.trim()
        ? d.message.trim()
        : "Request failed";
    throw new Error(msg);
  }
}

/** Unwraps a single resource from show/detail envelopes (`data`, nested `data.data`, `blog`, …). */
export function unwrapShowResource(body: unknown): Record<string, unknown> {
  assertApiEnvelopeSuccess(body);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid API response");
  }
  const root = body as Record<string, unknown>;
  let data = root.data;
  if (Array.isArray(data)) {
    if (data.length === 1 && data[0] && typeof data[0] === "object") {
      data = data[0];
    } else {
      throw new Error("Missing resource in API response");
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Missing resource in API response");
  }
  const rec = data as Record<string, unknown>;
  const nested = rec.blog ?? rec.blog_post ?? rec.service;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return { ...(nested as Record<string, unknown>), ...rec };
  }
  return rec;
}

/** Normalizes common Laravel / API list envelope shapes to a plain array. */
export function unwrapDataArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const inner =
      p.data ??
      p.categories ??
      p.items ??
      p.packages ??
      p.courses ??
      p.results ??
      p.blogs ??
      p.client_portfolio_items ??
      p.client_portfolio ??
      p.portfolio_items;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    if (inner && typeof inner === "object") {
      // Support newer envelopes such as `{ data: { blogs: [...], statistics, meta } }`.
      const innerRec = inner as Record<string, unknown>;
      const nestedCandidate =
        innerRec.data ??
        innerRec.blogs ??
        innerRec.items ??
        innerRec.categories ??
        innerRec.packages ??
        innerRec.courses ??
        innerRec.results;
      if (Array.isArray(nestedCandidate)) return nestedCandidate as Record<string, unknown>[];
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
