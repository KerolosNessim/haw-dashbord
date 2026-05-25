import { api } from "@/lib/api";
import { appendBilingualImageAlt, bilingualImageAltFromApi, type BilingualImageAlt } from "@/lib/bilingual-image-alt";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import type { LocaleString, SolutionFeature, SolutionItemsResponse } from "../types";

const BASE = "/v1/admin/solutions/singles";

function assertApiEnvelopeSuccess(data: unknown): void {
  if (data == null || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const s = d.status;
  if (s === false || s === "false" || s === 0 || s === "0") {
    const msg =
      typeof d.message === "string" && d.message.trim() ? d.message.trim() : "Request failed";
    throw new Error(msg);
  }
}

export type SolutionSingleFormPayload = {
  title: LocaleString;
  description: LocaleString;
  slug: LocaleString;
  category_id?: string | number | null;
  is_active?: boolean;
  image_alt?: BilingualImageAlt;
};

export type SolutionSinglesListParams = {
  category_id?: string | number;
  category_slug?: string;
  search?: string;
  per_page?: number;
  page?: number;
};

function payloadToFormData(p: SolutionSingleFormPayload, imageFile: File | null, mode: "create" | "update"): FormData {
  const fd = new FormData();
  if (mode === "update") {
    fd.append("_method", "PUT");
  }
  fd.append("title[ar]", p.title.ar.trim());
  fd.append("title[en]", p.title.en.trim());
  appendLocalizedDescriptionHtml(fd, "description", p.description.ar, p.description.en);
  fd.append("slug[ar]", (p.slug.ar ?? "").trim());
  fd.append("slug[en]", (p.slug.en ?? "").trim());
  if (typeof p.is_active === "boolean") {
    fd.append("is_active", p.is_active ? "1" : "0");
  }
  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  }
  if (p.image_alt) {
    appendBilingualImageAlt(fd, "image_alt", p.image_alt);
  }
  const categoryId =
    p.category_id != null && String(p.category_id).trim() !== ""
      ? String(p.category_id).trim()
      : "";
  if (categoryId) {
    fd.append("category_id", categoryId);
  }
  return fd;
}

export function solutionImageAltFromApi(raw: unknown): BilingualImageAlt {
  return bilingualImageAltFromApi(raw);
}

function normalizeSinglesListEnvelope(raw: unknown): SolutionItemsResponse {
  if (raw == null || typeof raw !== "object") {
    return { status: "true", message: "", data: [] };
  }
  const root = raw as Record<string, unknown>;
  const d = root.data;
  let items: SolutionFeature[] = [];
  if (Array.isArray(d)) {
    items = d as SolutionFeature[];
  } else if (d && typeof d === "object" && Array.isArray((d as Record<string, unknown>).data)) {
    items = (d as { data: SolutionFeature[] }).data;
  }
  return {
    ...(root as unknown as SolutionItemsResponse),
    data: items,
  };
}

function localizedValue(value: unknown, locale: "ar" | "en"): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localeValue = (value as Record<string, unknown>)[locale];
    return typeof localeValue === "string" ? localeValue.trim() : "";
  }
  return "";
}

function mergeLocalizedSingle(
  base: SolutionFeature,
  arSingle: SolutionFeature | null,
  enSingle: SolutionFeature | null,
): SolutionFeature {
  return {
    ...base,
    title: {
      ar: localizedValue(arSingle?.title, "ar") || localizedValue(base.title, "ar"),
      en: localizedValue(enSingle?.title, "en") || localizedValue(base.title, "en"),
    },
    description: {
      ar: localizedValue(arSingle?.description, "ar") || localizedValue(base.description, "ar"),
      en: localizedValue(enSingle?.description, "en") || localizedValue(base.description, "en"),
    },
    slug: {
      ar: localizedValue(arSingle?.slug, "ar") || localizedValue(base.slug, "ar"),
      en: localizedValue(enSingle?.slug, "en") || localizedValue(base.slug, "en"),
    },
    category: base.category ?? arSingle?.category ?? enSingle?.category ?? null,
  };
}

async function fetchSolutionSinglesForLocale(
  locale?: "ar" | "en",
  params?: SolutionSinglesListParams,
): Promise<SolutionItemsResponse> {
  const query: Record<string, string | number> = {};
  if (params?.category_id != null && String(params.category_id).trim()) {
    query.category_id = String(params.category_id).trim();
  }
  if (params?.category_slug?.trim()) {
    query.category_slug = params.category_slug.trim();
  }
  if (params?.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params?.per_page != null && params.per_page > 0) {
    query.per_page = params.per_page;
  }
  if (params?.page != null && params.page > 0) {
    query.page = params.page;
  }
  const res = await api.get<unknown>(BASE, {
    ...(locale ? { headers: { "Accept-Language": locale } } : {}),
    ...(Object.keys(query).length ? { params: query } : {}),
  });
  assertApiEnvelopeSuccess(res.data);
  return normalizeSinglesListEnvelope(res.data);
}

export async function fetchSolutionSingles(
  params?: SolutionSinglesListParams,
): Promise<SolutionItemsResponse> {
  return fetchSolutionSinglesForLocale(undefined, params);
}

export async function fetchSolutionSingleById(id: string | number): Promise<SolutionFeature | null> {
  const [arList, enList] = await Promise.all([
    fetchSolutionSinglesForLocale("ar"),
    fetchSolutionSinglesForLocale("en"),
  ]);
  const arSingle = arList.data.find((item) => String(item.id) === String(id)) ?? null;
  const enSingle = enList.data.find((item) => String(item.id) === String(id)) ?? null;
  const base = arSingle ?? enSingle;
  return base ? mergeLocalizedSingle(base, arSingle, enSingle) : null;
}

export async function createSolutionSingle(p: SolutionSingleFormPayload, imageFile: File | null) {
  const fd = payloadToFormData(p, imageFile, "create");
  const res = await api.post(BASE, fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function updateSolutionSingle(
  id: string | number,
  p: SolutionSingleFormPayload,
  imageFile: File | null,
) {
  if (imageFile instanceof File) {
    const fd = payloadToFormData(p, imageFile, "update");
    const res = await api.post(`${BASE}/${id}`, fd);
    assertApiEnvelopeSuccess(res.data);
    return res.data;
  }
  const categoryId =
    p.category_id != null && String(p.category_id).trim() !== ""
      ? String(p.category_id).trim()
      : null;
  const body = {
    title: p.title,
    description: p.description,
    slug: p.slug,
    ...(categoryId ? { category_id: categoryId } : { category_id: null }),
    ...(typeof p.is_active === "boolean" ? { is_active: p.is_active } : {}),
  };
  const res = await api.put(`${BASE}/${id}`, body);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function deleteSolutionSingle(id: string | number) {
  const res = await api.delete(`${BASE}/${id}`);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}
