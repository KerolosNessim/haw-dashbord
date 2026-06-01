import type { DeleteSlugRedirectPayload } from "@/lib/delete-slug-redirect";
import { API_BASE_URL } from "@/config/api";
import { api } from "@/lib/api";
import { pickBilingualSlug, pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import type {
  ServiceCatalogDetail,
  ServiceCatalogFormValues,
  ServiceCatalogRow,
} from "../types";

const ADMIN_BASE = "/v1/admin/service-catalog";

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

function unwrapEntity(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const top = payload as Record<string, unknown>;
  const d = top.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  return top;
}

function assetUrlFromApiPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/${trimmed.replace(/^\//, "")}`;
}

function coverFromRecord(raw: Record<string, unknown>): string | null {
  const image = raw.image ?? raw.images ?? raw.cover;
  if (typeof image === "string" && image.trim()) return assetUrlFromApiPath(image);
  if (image && typeof image === "object" && !Array.isArray(image)) {
    const o = image as Record<string, unknown>;
    const ar = typeof o.ar === "string" ? o.ar : null;
    const en = typeof o.en === "string" ? o.en : null;
    const pick = ar?.trim() || en?.trim();
    if (pick) return assetUrlFromApiPath(pick);
    const url = o.url ?? o.path;
    if (typeof url === "string" && url.trim()) return assetUrlFromApiPath(url);
  }
  return null;
}

function parseDescriptionFromApi(raw: unknown): { ar: string; en: string } {
  const empty = { ar: "", en: "" };
  if (raw == null) return empty;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t ? { ar: t, en: t } : empty;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return {
      ar: pickLocalized(raw, "ar"),
      en: pickLocalized(raw, "en"),
    };
  }
  return empty;
}

function normalizeRow(raw: unknown): ServiceCatalogRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  const slug = pickBilingualSlug(r.slug ?? r.slug_local);
  return {
    id,
    titleAr: pickLocalized(r.title, "ar"),
    titleEn: pickLocalized(r.title, "en"),
    subtitleAr: pickLocalized(r.subtitle, "ar"),
    subtitleEn: pickLocalized(r.subtitle, "en"),
    slug: slug.en || slug.ar,
    sort_order: typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order) || 0,
    is_active: Boolean(r.is_active ?? true),
    coverUrl: coverFromRecord(r),
  };
}

export function normalizeServiceCatalogList(payload: unknown): ServiceCatalogRow[] {
  return unwrapDataArray(payload)
    .map((row) => normalizeRow(row))
    .filter((x): x is ServiceCatalogRow => x != null);
}

export async function fetchServiceCatalogList(): Promise<ServiceCatalogRow[]> {
  const res = await api.get<unknown>(ADMIN_BASE);
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  return normalizeServiceCatalogList(body);
}

function appendFormFields(fd: FormData, values: ServiceCatalogFormValues) {
  fd.append("title[ar]", values.title.ar.trim());
  fd.append("title[en]", values.title.en.trim());
  fd.append("subtitle[ar]", values.subtitle.ar.trim());
  fd.append("subtitle[en]", values.subtitle.en.trim());
  appendLocalizedDescriptionHtml(fd, "description", values.description.ar, values.description.en);
  fd.append("slug[ar]", values.slug.ar.trim());
  fd.append("slug[en]", values.slug.en.trim());
  fd.append("sort_order", String(values.sort_order ?? 0));
  fd.append("is_active", values.is_active ? "1" : "0");
}

export async function createServiceCatalog(
  values: ServiceCatalogFormValues,
  imageFile: File | null,
) {
  const fd = new FormData();
  appendFormFields(fd, values);
  if (imageFile) fd.append("image", imageFile);
  const res = await api.post(ADMIN_BASE, fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function updateServiceCatalog(
  id: string,
  values: ServiceCatalogFormValues,
  imageFile: File | null,
) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendFormFields(fd, values);
  if (imageFile) fd.append("image", imageFile);
  const res = await api.post(`${ADMIN_BASE}/${encodeURIComponent(id)}`, fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function deleteServiceCatalog(id: string, payload: DeleteSlugRedirectPayload) {
  const res = await api.delete(`${ADMIN_BASE}/${encodeURIComponent(id)}`, { data: payload });
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export function recordToFormValues(raw: Record<string, unknown>): ServiceCatalogDetail {
  const slug = pickBilingualSlug(raw.slug ?? raw.slug_local);
  return {
    values: {
      title: {
        ar: pickLocalized(raw.title, "ar"),
        en: pickLocalized(raw.title, "en"),
      },
      subtitle: {
        ar: pickLocalized(raw.subtitle, "ar"),
        en: pickLocalized(raw.subtitle, "en"),
      },
      description: parseDescriptionFromApi(raw.description),
      slug: { ar: slug.ar, en: slug.en },
      sort_order: typeof raw.sort_order === "number" ? raw.sort_order : Number(raw.sort_order) || 0,
      is_active: Boolean(raw.is_active ?? true),
    },
    coverUrl: coverFromRecord(raw),
  };
}

export async function fetchServiceCatalogById(id: string): Promise<ServiceCatalogDetail | null> {
  try {
    const res = await api.get(`${ADMIN_BASE}/${encodeURIComponent(id)}`);
    const raw = unwrapEntity(res.data);
    if (raw && readId(raw)) return recordToFormValues(raw);
  } catch {
    /* fall through */
  }

  const list = await fetchServiceCatalogList();
  const row = list.find((r) => r.id === id);
  if (!row) return null;
  return {
    values: {
      title: { ar: row.titleAr, en: row.titleEn },
      subtitle: { ar: row.subtitleAr, en: row.subtitleEn },
      description: { ar: "", en: "" },
      slug: { ar: row.slug, en: row.slug },
      sort_order: row.sort_order,
      is_active: row.is_active,
    },
    coverUrl: row.coverUrl,
  };
}

export function extractCreatedIdFromResponse(res: unknown): string | null {
  const top = unwrapEntity(res);
  if (!top) return null;
  if (top.id != null) return String(top.id);
  const nested = top.service ?? top.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const id = (nested as Record<string, unknown>).id;
    if (id != null) return String(id);
  }
  return null;
}

/** For rich editor default values when loading HTML from API */
export function descriptionHtmlForEditor(html: string): string {
  return localizedHtmlForApi(html);
}
