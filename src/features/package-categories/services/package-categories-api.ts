import { api } from "@/lib/api";
import { pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type { PackageCategoryFormValues, PackageCategoryRow } from "../types";

/**
 * Admin package categories — Postman: `GET|POST …/v1/admin/packages/categories`,
 * show/update/delete `…/categories/{id}`. Store/Update use **multipart** (`title[ar]`, `title[en]`, …).
 * Update is sent as `POST` + `_method=PUT` (Laravel spoof) like other multipart admin forms.
 */
const ADMIN_PACKAGE_CATEGORIES_BASE = "/v1/admin/packages/categories";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** Laravel ApiResponse: HTTP 2xx with `status: "false"` must surface as failure. */
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

function isApiEnvelopeFailure(rec: Record<string, unknown>): boolean {
  const s = rec.status;
  return s === "false" || s === false || s === 0 || s === "0";
}

function pickPackageCategoryRecord(payload: unknown): Record<string, unknown> | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  if (isApiEnvelopeFailure(rec)) return null;

  const id = rec.id;
  const slugVal = rec.slug;
  if (id != null && typeof slugVal === "string" && slugVal.trim() !== "") {
    return rec;
  }

  const dataVal = rec.data;
  if (dataVal != null && typeof dataVal === "object" && !Array.isArray(dataVal)) {
    const inner = pickPackageCategoryRecord(dataVal);
    if (inner) return inner;
  }

  for (const key of ["package_category", "category"] as const) {
    const next = rec[key];
    if (next != null && typeof next === "object" && !Array.isArray(next)) {
      const inner = pickPackageCategoryRecord(next);
      if (inner) return inner;
    }
  }

  return null;
}

function normalizeCategoryRecord(raw: unknown): PackageCategoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  return {
    id,
    titleAr: pickLocalized(r.title, "ar") || pickLocalized(r.name, "ar"),
    titleEn: pickLocalized(r.title, "en") || pickLocalized(r.name, "en"),
    slug: typeof r.slug === "string" ? r.slug : "",
    sort_order: typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order) || 0,
    is_active: Boolean(r.is_active ?? r.isActive ?? true),
    is_default: Boolean(r.is_default ?? r.isDefault ?? false),
  };
}

export function normalizeCategoryListPayload(payload: unknown): PackageCategoryRow[] {
  return unwrapDataArray(payload)
    .map((row) => normalizeCategoryRecord(row))
    .filter((x): x is PackageCategoryRow => x != null);
}

export async function fetchPackageCategories(): Promise<PackageCategoryRow[]> {
  const tryUrls = [ADMIN_PACKAGE_CATEGORIES_BASE, "/v1/packages/categories"];
  let lastErr: unknown;
  for (const url of tryUrls) {
    try {
      const res = await api.get<unknown>(url);
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return normalizeCategoryListPayload(body);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/** Postman multipart fields + optional SEO / default flags the dashboard collects. */
function appendPackageCategoryFormFields(fd: FormData, values: PackageCategoryFormValues) {
  fd.append("title[ar]", values.title.ar.trim());
  fd.append("title[en]", values.title.en.trim());
  fd.append("slug", values.slug.trim());
  fd.append("sort_order", String(values.sort_order ?? 0));
  fd.append("is_active", values.is_active ? "1" : "0");
  fd.append("is_default", values.is_default ? "1" : "0");
  fd.append("meta_title[ar]", values.meta_title.ar.trim());
  fd.append("meta_title[en]", values.meta_title.en.trim());
  fd.append("meta_description[ar]", values.meta_description.ar.trim());
  fd.append("meta_description[en]", values.meta_description.en.trim());
  fd.append("meta_keywords[ar]", values.meta_keywords.ar.trim());
  fd.append("meta_keywords[en]", values.meta_keywords.en.trim());
}

export async function createPackageCategory(values: PackageCategoryFormValues) {
  const fd = new FormData();
  appendPackageCategoryFormFields(fd, values);
  const res = await api.post(ADMIN_PACKAGE_CATEGORIES_BASE, fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function updatePackageCategory(id: string, values: PackageCategoryFormValues) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendPackageCategoryFormFields(fd, values);
  const res = await api.post(
    `${ADMIN_PACKAGE_CATEGORIES_BASE}/${encodeURIComponent(id)}`,
    fd,
  );
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function deletePackageCategory(id: string) {
  const res = await api.delete(`${ADMIN_PACKAGE_CATEGORIES_BASE}/${encodeURIComponent(id)}`);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

/** Map a flat category JSON object into form values (not an ApiResponse envelope). */
export function recordToFormValues(raw: unknown): PackageCategoryFormValues | null {
  const r = asRecord(raw);
  if (!r) return null;
  const titleObj = r.title;
  const metaTitleObj = r.meta_title;
  const metaDescObj = r.meta_description;
  const metaKwObj = r.meta_keywords;
  return {
    title: {
      ar: pickLocalized(titleObj, "ar"),
      en: pickLocalized(titleObj, "en"),
    },
    slug: typeof r.slug === "string" ? r.slug : "",
    sort_order:
      typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order) || 0,
    is_active: Boolean(r.is_active ?? true),
    is_default: Boolean(r.is_default ?? false),
    meta_title: {
      ar: pickLocalized(metaTitleObj, "ar"),
      en: pickLocalized(metaTitleObj, "en"),
    },
    meta_description: {
      ar: pickLocalized(metaDescObj, "ar"),
      en: pickLocalized(metaDescObj, "en"),
    },
    meta_keywords: {
      ar: pickLocalized(metaKwObj, "ar"),
      en: pickLocalized(metaKwObj, "en"),
    },
  };
}

export async function fetchPackageCategoryById(id: string): Promise<PackageCategoryFormValues | null> {
  const urls = [`${ADMIN_PACKAGE_CATEGORIES_BASE}/${encodeURIComponent(id)}`];
  for (const url of urls) {
    try {
      const res = await api.get(url);
      const leaf =
        pickPackageCategoryRecord(res.data) ??
        pickPackageCategoryRecord((res.data as { data?: unknown })?.data);
      const parsed = leaf ? recordToFormValues(leaf) : null;
      if (parsed) return parsed;
    } catch {
      /* next */
    }
  }

  try {
    const list = await fetchPackageCategories();
    const row = list.find((c) => c.id === id);
    if (!row) return null;
    return {
      title: { ar: row.titleAr, en: row.titleEn },
      slug: row.slug,
      sort_order: row.sort_order,
      is_active: row.is_active,
      is_default: row.is_default,
      meta_title: { ar: "", en: "" },
      meta_description: { ar: "", en: "" },
      meta_keywords: { ar: "", en: "" },
    };
  } catch {
    return null;
  }
}
