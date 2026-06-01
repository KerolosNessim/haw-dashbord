/** Bilingual image alt text (AR/EN) — matches API `image_alt`, `benefits_image_alt`, etc. */

export type BilingualImageAlt = { ar: string; en: string };

export function emptyBilingualImageAlt(): BilingualImageAlt {
  return { ar: "", en: "" };
}

/** Reads bilingual alt from TipTap image node attributes (falls back to legacy `alt`). */
export function bilingualImageAltFromNodeAttrs(attrs: Record<string, unknown>): BilingualImageAlt {
  const ar = String(attrs["data-alt-ar"] ?? "");
  const en = String(attrs["data-alt-en"] ?? "");
  if (ar || en) return { ar, en };
  const legacy = String(attrs.alt ?? "").trim();
  if (legacy) return { ar: legacy, en: legacy };
  return { ar: "", en: "" };
}

/** Maps GET `image_alt` (string, `{ ar, en }`, or null) to form values. */
export function bilingualImageAltFromApi(raw: unknown): BilingualImageAlt {
  if (raw == null) return emptyBilingualImageAlt();
  if (typeof raw === "string") return { ar: raw, en: raw };
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as { ar?: string | null; en?: string | null };
    return { ar: o.ar ?? "", en: o.en ?? "" };
  }
  return emptyBilingualImageAlt();
}

/** Appends `prefix[ar]` and `prefix[en]` (e.g. `image_alt`, `benefits_image_alt`, `icon_alt`). */
export function appendBilingualImageAlt(
  fd: FormData,
  prefix: string,
  alt: BilingualImageAlt | undefined,
): void {
  if (!alt) return;
  fd.append(`${prefix}[ar]`, (alt.ar ?? "").trim());
  fd.append(`${prefix}[en]`, (alt.en ?? "").trim());
}
