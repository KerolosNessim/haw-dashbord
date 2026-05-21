import type { LocalizedField, LocalizedString, Service, ServiceImageAlt, ServiceImageUrls } from "../type";

export function pickLocalizedField(field: LocalizedField | null | undefined): LocalizedString {
  if (!field) return { ar: "", en: "" };
  if (typeof field === "string") return { ar: field, en: field };
  return { ar: field.ar ?? "", en: field.en ?? "" };
}

export function pickServiceImage(field: unknown): ServiceImageUrls {
  if (!field) return { ar: null, en: null };
  if (typeof field === "string") return { ar: field, en: null };
  if (typeof field === "object" && field !== null) {
    const o = field as { ar?: string | null; en?: string | null };
    return { ar: o.ar ?? null, en: o.en ?? null };
  }
  return { ar: null, en: null };
}

export function pickServiceImageAlt(field: unknown): ServiceImageAlt {
  if (!field || typeof field !== "object") return { ar: "", en: "" };
  const o = field as { ar?: string | null; en?: string | null };
  return { ar: o.ar ?? "", en: o.en ?? "" };
}

/** Single package image from API (string or legacy { ar, en } object). */
export function pickPackageImage(field: unknown): string | null {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null) {
    const o = field as { ar?: string | null; en?: string | null };
    return o.ar ?? o.en ?? null;
  }
  return null;
}

/** Prefer Arabic cover, then English (for list cards). */
export function serviceCoverUrl(
  image: ServiceImageUrls | string | null | undefined,
  prefer: "ar" | "en" = "ar",
): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (prefer === "en") return image.en || image.ar;
  return image.ar || image.en;
}

export function normalizeService(raw: Record<string, unknown>): Service {
  return {
    id: Number(raw.id),
    slug: pickLocalizedField(raw.slug as LocalizedField),
    image: pickServiceImage(raw.image),
    image_alt: pickServiceImageAlt(raw.image_alt ?? null),
    title: pickLocalizedField(raw.title as LocalizedField),
    description: pickLocalizedField(raw.description as LocalizedField),
    highlight_description: pickLocalizedField(raw.highlight_description as LocalizedField),
    inside_desc: pickLocalizedField(raw.inside_desc as LocalizedField),
    media_url: (raw.media_url as string | null) ?? null,
    media_type: (raw.media_type as string | null) ?? null,
    meta_title: pickLocalizedField(raw.meta_title as LocalizedField),
    meta_description: pickLocalizedField(raw.meta_description as LocalizedField),
    is_active: Boolean(raw.is_active ?? true),
    show_footer: Boolean(raw.show_footer ?? true),
    sort_order: Number(raw.sort_order ?? 0),
    countries: Array.isArray(raw.countries) ? (raw.countries as Service["countries"]) : [],
    created_at: String(raw.created_at ?? ""),
    benefits: raw.benefits,
    faqs: raw.faqs,
    packages: raw.packages,
    steps: raw.steps,
    tools: raw.tools,
    ctas: raw.ctas,
  };
}
