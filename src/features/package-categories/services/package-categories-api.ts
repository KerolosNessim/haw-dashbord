import { api } from "@/lib/api";
import { pickBilingualSlug, pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type { PackageCategoryFormValues, PackageCategoryRow } from "../types";

/** Laravel paginator summary from `data.meta` (snake_case → camelCase). */
export type PackageCategoryMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type PackageCategoryPage = {
  rows: PackageCategoryRow[];
  meta: PackageCategoryMeta;
};

export type PackageCategoryListParams = {
  page?: number;
  perPage?: number;
};

/**
 * Admin package categories — Postman: `GET|POST …/v1/admin/packages/categories`,
 * show/update/delete `…/categories/{id}`. Store/Update use **multipart** (`title[ar|en]`, `slug[ar|en]`, `sort_order`, `is_active`, …).
 * Update is sent as `POST` + `_method=PUT` (Laravel spoof) like other multipart admin forms.
 */
const ADMIN_PACKAGE_CATEGORIES_BASE = "/v1/admin/packages/categories";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function toFiniteNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
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
  const slugLooksPresent =
    (typeof slugVal === "string" && slugVal.trim() !== "") ||
    (slugVal != null && typeof slugVal === "object" && !Array.isArray(slugVal)) ||
    (Array.isArray(slugVal) &&
      slugVal.some((s) => typeof s === "string" && String(s).trim() !== ""));
  if (id != null && slugLooksPresent) {
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
  const slug = pickBilingualSlug(r.slug);
  return {
    id,
    titleAr: pickLocalized(r.title, "ar") || pickLocalized(r.name, "ar"),
    titleEn: pickLocalized(r.title, "en") || pickLocalized(r.name, "en"),
    slug: slug.en || slug.ar,
    sort_order: typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order) || 0,
    is_active: Boolean(r.is_active ?? r.isActive ?? true),
  };
}

export function normalizeCategoryListPayload(payload: unknown): PackageCategoryRow[] {
  return unwrapDataArray(payload)
    .map((row) => normalizeCategoryRecord(row))
    .filter((x): x is PackageCategoryRow => x != null);
}

function pickCategoryListMeta(payload: unknown): PackageCategoryMeta {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta);
  return {
    currentPage: toFiniteNumber(meta?.current_page, 1),
    lastPage: toFiniteNumber(meta?.last_page, 1),
    perPage: toFiniteNumber(meta?.per_page, 0),
    total: toFiniteNumber(meta?.total),
  };
}

async function fetchPackageCategoriesPageFromUrl(
  url: string,
  page?: number,
  perPage?: number,
): Promise<PackageCategoryPage> {
  const params: Record<string, number> = {};
  if (page && page > 0) params.page = page;
  if (perPage && perPage > 0) params.per_page = perPage;
  const res = await api.get<unknown>(url, { params });
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const rows = normalizeCategoryListPayload(body);
  const meta = pickCategoryListMeta(res.data);
  return {
    rows,
    meta,
  };
}

/**
 * Single list page (`GET …/categories?page=&per_page=`).
 * Response shape: `{ data: { data: [...], meta } }`.
 */
export async function fetchPackageCategoriesPage(
  params: PackageCategoryListParams = {},
): Promise<PackageCategoryPage> {
  const tryUrls = [ADMIN_PACKAGE_CATEGORIES_BASE, "/v1/packages/categories"];
  let lastErr: unknown;
  for (const url of tryUrls) {
    try {
      return await fetchPackageCategoriesPageFromUrl(url, params.page, params.perPage);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function fetchPackageCategories(): Promise<PackageCategoryRow[]> {
  const tryUrls = [ADMIN_PACKAGE_CATEGORIES_BASE, "/v1/packages/categories"];
  let lastErr: unknown;
  for (const url of tryUrls) {
    try {
      const first = await fetchPackageCategoriesPageFromUrl(url);
      if (first.meta.lastPage <= 1) return first.rows;
      const remainingPages = Array.from(
        { length: first.meta.lastPage - 1 },
        (_, i) => i + 2,
      );
      const rest = await Promise.all(
        remainingPages.map((p) =>
          fetchPackageCategoriesPageFromUrl(url, p, first.meta.perPage || undefined),
        ),
      );
      return rest.reduce<PackageCategoryRow[]>(
        (acc, page) => acc.concat(page.rows),
        first.rows,
      );
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/** Multipart for Store/Update — `title[ar|en]`, `slug[ar|en]`, `sort_order`, `is_active`. */
function appendPackageCategoryFormFields(fd: FormData, values: PackageCategoryFormValues) {
  fd.append("title[ar]", values.title.ar.trim());
  fd.append("title[en]", values.title.en.trim());
  fd.append("slug[ar]", values.slug.ar.trim());
  fd.append("slug[en]", values.slug.en.trim());
  fd.append("sort_order", String(values.sort_order ?? 0));
  fd.append("is_active", values.is_active ? "1" : "0");
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
  const slug = pickBilingualSlug(r.slug);
  return {
    title: {
      ar: pickLocalized(titleObj, "ar"),
      en: pickLocalized(titleObj, "en"),
    },
    slug: { ar: slug.ar, en: slug.en },
    sort_order:
      typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order) || 0,
    is_active: Boolean(r.is_active ?? true),
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
      slug: { ar: row.slug, en: row.slug },
      sort_order: row.sort_order,
      is_active: row.is_active,
    };
  } catch {
    return null;
  }
}
