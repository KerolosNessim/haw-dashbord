import { api } from "@/lib/api";
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
  is_active?: boolean;
};

function payloadToFormData(p: SolutionSingleFormPayload, imageFile: File | null, mode: "create" | "update"): FormData {
  const fd = new FormData();
  if (mode === "update") {
    fd.append("_method", "PUT");
  }
  fd.append("title[ar]", p.title.ar.trim());
  fd.append("title[en]", p.title.en.trim());
  fd.append("description[ar]", p.description.ar ?? "");
  fd.append("description[en]", p.description.en ?? "");
  fd.append("slug[ar]", (p.slug.ar ?? "").trim());
  fd.append("slug[en]", (p.slug.en ?? "").trim());
  if (typeof p.is_active === "boolean") {
    fd.append("is_active", p.is_active ? "1" : "0");
  }
  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  }
  return fd;
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
  };
}

async function fetchSolutionSinglesForLocale(locale?: "ar" | "en"): Promise<SolutionItemsResponse> {
  const res = await api.get<unknown>(BASE, locale ? { headers: { "Accept-Language": locale } } : undefined);
  assertApiEnvelopeSuccess(res.data);
  return normalizeSinglesListEnvelope(res.data);
}

export async function fetchSolutionSingles(): Promise<SolutionItemsResponse> {
  return fetchSolutionSinglesForLocale();
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
  const body = {
    title: p.title,
    description: p.description,
    slug: p.slug,
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
