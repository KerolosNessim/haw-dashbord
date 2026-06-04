import { api } from "@/lib/api";
import { bilingualSectionImageFromApi } from "@/lib/bilingual-section-image";
import { appendCountryIdsToFormData, countryIdsQuery } from "@/features/home-content/lib/country-scope";
import {
  appendLocalizedDescriptionHtml,
  localizedHtmlForApi,
} from "@/lib/localized-html-form";
import { appendIndexedBilingualSectionImage } from "@/features/services/utils/append-bilingual-section-image";
import type {
  LocalizedText,
  PromoBannerSection,
  PromoBannerSlide,
  PromoSectionFormValues,
  PromoSlideFormItem,
  PromoSlidesFormValues,
} from "../types";
import { isAxiosError } from "axios";

const SLIDES_BASE = "/v1/admin/home/promo-banners";
const SECTION_PATH = "/v1/admin/home/promo-banners/section";
const BULK_SYNC_PATH = "/v1/admin/home/promo-banners/bulk-sync";

function pickLocalized(input: unknown): LocalizedText {
  if (typeof input === "string") return { ar: input, en: input };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ar: "", en: "" };
  const row = input as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : "",
    en: typeof row.en === "string" ? row.en : "",
  };
}

function extractPayload(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in data) {
    const payload = (data as { data?: unknown }).data;
    if (payload != null) return payload;
  }
  return data;
}

function normalizeSection(input: unknown): PromoBannerSection {
  const row = (extractPayload(input) ?? {}) as Record<string, unknown>;
  return {
    id: Number(row.id ?? 1),
    eyebrow: pickLocalized(row.eyebrow),
    title: pickLocalized(row.title),
    subtitle: pickLocalized(row.subtitle),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

function normalizeSlide(raw: unknown, index: number): PromoBannerSlide {
  const row = (raw ?? {}) as Record<string, unknown>;
  const imageUrls = bilingualSectionImageFromApi(row.image);
  return {
    id: Number(row.id ?? 0),
    sort_order: Number(row.sort_order ?? index),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    badge: pickLocalized(row.badge),
    title: pickLocalized(row.title),
    subtitle: pickLocalized(row.subtitle),
    description: pickLocalized(row.description),
    button_text: pickLocalized(row.button_text),
    button_link: pickLocalized(row.button_link),
    image: { ar: imageUrls.ar, en: imageUrls.en },
    image_alt: pickLocalized(row.image_alt),
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export function slideToFormItem(slide: PromoBannerSlide): PromoSlideFormItem {
  return {
    id: slide.id || undefined,
    is_active: slide.is_active,
    badge_ar: slide.badge.ar,
    badge_en: slide.badge.en,
    title_ar: slide.title.ar,
    title_en: slide.title.en,
    subtitle_ar: slide.subtitle.ar,
    subtitle_en: slide.subtitle.en,
    description_ar: slide.description.ar,
    description_en: slide.description.en,
    button_text_ar: slide.button_text.ar,
    button_text_en: slide.button_text.en,
    button_link_ar: slide.button_link.ar,
    button_link_en: slide.button_link.en,
    image_alt_ar: slide.image_alt.ar,
    image_alt_en: slide.image_alt.en,
    image: { ar: slide.image.ar, en: slide.image.en },
  };
}

export function emptySlideFormItem(): PromoSlideFormItem {
  return {
    is_active: true,
    badge_ar: "",
    badge_en: "",
    title_ar: "",
    title_en: "",
    subtitle_ar: "",
    subtitle_en: "",
    description_ar: "",
    description_en: "",
    button_text_ar: "",
    button_text_en: "",
    button_link_ar: "",
    button_link_en: "",
    image_alt_ar: "",
    image_alt_en: "",
    image: { ar: null, en: null },
  };
}

function appendLocalizedField(fd: FormData, prefix: string, ar: string, en: string) {
  fd.append(`${prefix}[ar]`, ar);
  fd.append(`${prefix}[en]`, en);
}

function buildBulkFormData(
  values: PromoSlidesFormValues,
  countryIds?: number[],
): FormData {
  const fd = new FormData();
  appendCountryIdsToFormData(fd, countryIds);

  values.items.forEach((item, index) => {
    const base = `slides[${index}]`;
    fd.append(`${base}[id]`, item.id ? String(item.id) : "");
    fd.append(`${base}[sort_order]`, String(index));
    fd.append(`${base}[is_active]`, item.is_active ? "1" : "0");

    fd.append(`${base}[title][ar]`, localizedHtmlForApi(item.title_ar));
    fd.append(`${base}[title][en]`, localizedHtmlForApi(item.title_en));
    appendLocalizedField(fd, `${base}[badge]`, item.badge_ar, item.badge_en);
    fd.append(`${base}[subtitle][ar]`, localizedHtmlForApi(item.subtitle_ar));
    fd.append(`${base}[subtitle][en]`, localizedHtmlForApi(item.subtitle_en));
    appendLocalizedField(fd, `${base}[button_text]`, item.button_text_ar, item.button_text_en);
    appendLocalizedField(fd, `${base}[button_link]`, item.button_link_ar, item.button_link_en);
    appendLocalizedField(fd, `${base}[image_alt]`, item.image_alt_ar, item.image_alt_en);

    appendLocalizedDescriptionHtml(fd, `${base}[description]`, item.description_ar, item.description_en);
    appendIndexedBilingualSectionImage(fd, "slides", index, item.image);
  });

  return fd;
}

export async function fetchPromoBannerSection(
  countryIds?: number[],
): Promise<PromoBannerSection | null> {
  try {
    const res = await api.get(SECTION_PATH, {
      params: countryIdsQuery(countryIds),
    });
    return normalizeSection(res.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function updatePromoBannerSection(
  values: PromoSectionFormValues,
  countryIds?: number[],
) {
  const ids = (countryIds ?? []).filter((id) => id > 0);
  const res = await api.put(SECTION_PATH, {
    eyebrow: {
      ar: localizedHtmlForApi(values.eyebrow_ar),
      en: localizedHtmlForApi(values.eyebrow_en),
    },
    title: {
      ar: localizedHtmlForApi(values.title_ar),
      en: localizedHtmlForApi(values.title_en),
    },
    subtitle: {
      ar: localizedHtmlForApi(values.subtitle_ar),
      en: localizedHtmlForApi(values.subtitle_en),
    },
    is_active: values.is_active,
    country_ids: ids,
  });
  return res.data as { message?: string };
}

export async function fetchPromoBannerSlides(
  countryIds?: number[],
): Promise<PromoBannerSlide[]> {
  const res = await api.get(SLIDES_BASE, {
    params: countryIdsQuery(countryIds),
  });
  const payload = extractPayload(res.data);
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map(normalizeSlide).sort((a, b) => a.sort_order - b.sort_order);
}

export async function bulkSyncPromoBannerSlides(
  values: PromoSlidesFormValues,
  countryIds?: number[],
) {
  const res = await api.post(BULK_SYNC_PATH, buildBulkFormData(values, countryIds), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data as { message?: string };
}
