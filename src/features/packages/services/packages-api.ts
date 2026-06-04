import { API_BASE_URL } from "@/config/api";
import { api } from "@/lib/api";
import { appendCountryIdsToFormData, countryIdsQuery } from "@/features/home-content/lib/country-scope";
import { parseCountryIdsFromApi } from "@/features/shared/lib/parse-country-ids";
import { appendBilingualImageAlt, bilingualImageAltFromApi } from "@/lib/bilingual-image-alt";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import { pickBilingualSlug, pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type { PackageFormValues, PackageRow } from "../types";

export type PackageMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type PackagePage = {
  rows: PackageRow[];
  meta: PackageMeta;
};

export type PackageListParams = {
  page?: number;
  perPage?: number;
  /** Postman: `GET …/v1/admin/packages?search=` — filter by title/description */
  search?: string;
  countryIds?: number[];
};

/** Build absolute URL for media paths returned by the backend (dashboard). */
function resolveUploadedMediaUrl(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const path = raw.trim();
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}

function resolvePackageIconPreview(r: Record<string, unknown>): string {
  if (typeof r.image === "string" && r.image.trim()) {
    return resolveUploadedMediaUrl(r.image);
  }
  const fileUrl = r.icon_url ?? r.icon_full_url ?? r.icon_original_url ?? r.original_icon_url ?? r.original_image_url;
  if (typeof fileUrl === "string" && fileUrl.trim()) return resolveUploadedMediaUrl(fileUrl);
  const nested = r.icon;
  if (typeof nested === "string" && nested.trim()) return resolveUploadedMediaUrl(nested);
  if (nested && typeof nested === "object") {
    const o = nested as Record<string, unknown>;
    const u = o.full_url ?? o.url ?? o.path;
    if (typeof u === "string") return resolveUploadedMediaUrl(u);
  }
  return "";
}

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

/** Laravel ApiResponse: HTTP 200 with `{ status: "false", message }` is still a failure. */
function assertApiEnvelopeSuccess(data: unknown): void {
  if (data == null || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const s = d.status;
  if (s === false || s === "false" || s === 0 || s === "0") {
    const msg = typeof d.message === "string" && d.message.trim() ? d.message.trim() : "Request failed";
    throw new Error(msg);
  }
}

function pickPackagePayloadRecord(payload: unknown): Record<string, unknown> | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  const s = rec.status;
  if (s === false || s === "false" || s === 0 || s === "0") return null;

  const id = rec.id;
  const title = rec.title ?? rec.name;
  const looksLikePackage =
    (typeof id === "number" || typeof id === "string") &&
    (title != null ||
      rec.package_category_id != null ||
      rec.package_category != null ||
      rec.category != null ||
      rec.slug != null ||
      rec.description != null);
  if (looksLikePackage) return rec;

  const dataVal = rec.data;
  if (Array.isArray(dataVal) && dataVal.length === 1) {
    const one = pickPackagePayloadRecord(dataVal[0]);
    if (one) return one;
  } else if (dataVal && typeof dataVal === "object" && !Array.isArray(dataVal)) {
    const one = pickPackagePayloadRecord(dataVal);
    if (one) return one;
  }

  const nested = rec.package ?? rec.package_item;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const one = pickPackagePayloadRecord(nested);
    if (one) return one;
  }

  return null;
}

function categoryLabel(cat: unknown, lang: "ar" | "en"): string {
  if (!cat || typeof cat !== "object") return "";
  const c = cat as Record<string, unknown>;
  return pickLocalized(c.title, lang) || pickLocalized(c.name, lang) || String(c.slug ?? "");
}

function stringifyIdValue(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function readNestedCategoryId(value: unknown): string {
  const direct = stringifyIdValue(value);
  if (direct) return direct;
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";

  const o = value as Record<string, unknown>;
  for (const key of ["id", "uuid", "package_category_id", "category_id", "packageCategoryId", "categoryId", "value"]) {
    const id = stringifyIdValue(o[key]);
    if (id) return id;
  }

  for (const key of ["data", "package_category", "packageCategory", "category", "pivot"]) {
    const id = readNestedCategoryId(o[key]);
    if (id) return id;
  }

  return "";
}

/** Resolves category id from flat keys or nested `package_category` / `category` relation shapes. */
function readPackageCategoryId(r: Record<string, unknown>): string {
  for (const key of [
    "package_category_id",
    "packageCategoryId",
    "category_id",
    "categoryId",
    "package_category",
    "packageCategory",
    "category",
  ]) {
    const id = readNestedCategoryId(r[key]);
    if (id) return id;
  }
  return "";
}

function normalizePackageRecord(raw: unknown, locale: "ar" | "en" = "en"): PackageRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  const pkgCat =
    r.package_category ??
    r.category ??
    r.packageCategory ??
    (typeof r.package_category_id === "object" && r.package_category_id !== null
      ? r.package_category_id
      : null);

  const categoryId = readPackageCategoryId(r);

  const slugPair = pickBilingualSlug(r.slug);
  return {
    id,
    titleAr: pickLocalized(r.title, "ar"),
    titleEn: pickLocalized(r.title, "en"),
    slug: slugPair.en || slugPair.ar || "",
    package_category_id: categoryId,
    categoryTitle:
      pkgCat && typeof pkgCat === "object"
        ? `${categoryLabel(pkgCat, locale)}`.trim()
        : categoryId,
    is_featured: Boolean(
      r.is_featured ??
        r.is_popular ??
        r.isFeatured ??
        r.highlighted ??
        false,
    ),
    is_active: Boolean(r.is_active ?? r.isActive ?? true),
  };
}

export function normalizePackageListPayload(
  payload: unknown,
  locale: "ar" | "en",
): PackageRow[] {
  return unwrapDataArray(payload)
    .map((row) => normalizePackageRecord(row, locale))
    .filter((x): x is PackageRow => x != null);
}

export function pickPackageMeta(payload: unknown): PackageMeta {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta);
  return {
    currentPage: toFiniteNumber(meta?.current_page, 1),
    lastPage: toFiniteNumber(meta?.last_page, 1),
    perPage: toFiniteNumber(meta?.per_page, 0),
    total: toFiniteNumber(meta?.total, 0),
  };
}

export async function fetchPackagesPage(
  locale: "ar" | "en",
  params: PackageListParams = {},
): Promise<PackagePage> {
  const urls = ["/v1/admin/packages", "/v1/packages"];
  const query: Record<string, string | number> = {};
  if (params.page && params.page > 0) query.page = params.page;
  if (params.perPage && params.perPage > 0) query.per_page = params.perPage;
  const q = params.search?.trim();
  if (q) query.search = q;
  const countryParams = countryIdsQuery(params.countryIds);
  if (countryParams) Object.assign(query, countryParams);

  let lastErr: unknown;
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url, { params: query });
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return {
        rows: normalizePackageListPayload(body, locale),
        meta: pickPackageMeta(res.data),
      };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function fetchPackages(locale: "ar" | "en"): Promise<PackageRow[]> {
  return (await fetchPackagesPage(locale)).rows;
}

async function fetchPackageRowById(
  id: string,
  locale: "ar" | "en",
  countryIds?: number[],
): Promise<PackageRow | null> {
  const first = await fetchPackagesPage(locale, { perPage: 100, countryIds });
  const firstHit = first.rows.find((p) => p.id === id);
  if (firstHit) return firstHit;

  for (let page = 2; page <= first.meta.lastPage; page += 1) {
    const next = await fetchPackagesPage(locale, {
      page,
      perPage: first.meta.perPage || 100,
      countryIds,
    });
    const hit = next.rows.find((p) => p.id === id);
    if (hit) return hit;
  }

  return null;
}

function appendLocalized(fd: FormData, prefix: string, value: { ar: string; en: string }) {
  fd.append(`${prefix}[ar]`, value.ar);
  fd.append(`${prefix}[en]`, value.en);
}

function appendDescription(fd: FormData, value: { ar: string; en: string }) {
  appendLocalizedDescriptionHtml(fd, "description", value.ar, value.en);
}

export function packageValuesToFormData(
  values: PackageFormValues,
  iconFile: File | null,
): FormData {
  const { existing_icon_url: _preview, ...v } = values;
  void _preview;

  const fd = new FormData();
  appendCountryIdsToFormData(fd, v.country_ids);
  fd.append("package_category_id", v.package_category_id);
  appendLocalized(fd, "title", v.title);
  appendDescription(fd, v.description);
  appendLocalized(fd, "button_text", v.button_text);
  appendLocalized(fd, "slug", {
    ar: v.slug.ar.trim(),
    en: v.slug.en.trim(),
  });

  fd.append("is_featured", v.is_featured ? "1" : "0");
  fd.append("is_active", v.is_active ? "1" : "0");
  if (v.price.trim()) fd.append("price", v.price.trim());
  if (v.currency.trim()) fd.append("currency", v.currency.trim());

  if (iconFile instanceof File) {
    fd.append("image", iconFile);
    fd.append("icon", iconFile);
  }
  appendBilingualImageAlt(fd, "image_alt", v.icon_alt);

  v.features.forEach((feat, i) => {
    appendLocalized(fd, `features[${i}][title]`, feat.title);
    fd.append(`features[${i}][is_included]`, feat.is_included ? "1" : "0");
    fd.append(`features[${i}][sort_order]`, String(feat.sort_order ?? i));
  });

  return fd;
}

export async function createPackage(values: PackageFormValues, iconFile: File | null) {
  const fd = packageValuesToFormData(values, iconFile);
  const res = await api.post("/v1/admin/packages", fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

/** POST multipart with Laravel-style method spoof (_method=PUT) per API contract */
export async function updatePackage(
  packageId: string,
  values: PackageFormValues,
  iconFile: File | null,
) {
  const fd = packageValuesToFormData(values, iconFile);
  fd.append("_method", "PUT");
  const res = await api.post(`/v1/admin/packages/${packageId}`, fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function deletePackage(packageId: string) {
  const res = await api.delete(`/v1/admin/packages/${packageId}`);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

function parseFeatures(raw: unknown): PackageFormValues["features"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: {
        ar: pickLocalized(item.title, "ar"),
        en: pickLocalized(item.title, "en"),
      },
      is_included: Boolean(item.is_included ?? item.isIncluded ?? true),
      sort_order:
        typeof item.sort_order === "number"
          ? item.sort_order
          : item.sort_order != null
            ? Number(item.sort_order) || 0
            : 0,
    }));
}

export function recordToPackageFormValues(raw: unknown): PackageFormValues | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pkgCat = r.package_category ?? r.category ?? r.packageCategory;
  const categoryId = readPackageCategoryId(r);

  const iconPreview = resolvePackageIconPreview(r);
  const categoryTitleAr =
    pkgCat && typeof pkgCat === "object" ? categoryLabel(pkgCat, "ar") : "";
  const categoryTitleEn =
    pkgCat && typeof pkgCat === "object" ? categoryLabel(pkgCat, "en") : "";

  return {
    country_ids: parseCountryIdsFromApi(r),
    package_category_id: categoryId,
    title: { ar: pickLocalized(r.title, "ar"), en: pickLocalized(r.title, "en") },
    description: {
      ar: pickLocalized(r.description, "ar"),
      en: pickLocalized(r.description, "en"),
    },
    button_text: {
      ar: pickLocalized(r.button_text, "ar"),
      en: pickLocalized(r.button_text, "en"),
    },
    slug: pickBilingualSlug(r.slug),
    is_featured: Boolean(r.is_featured ?? r.is_popular ?? false),
    is_active: Boolean(r.is_active ?? true),
    price: r.price != null ? String(r.price) : "",
    currency: typeof r.currency === "string" ? r.currency : "",
    features: parseFeatures(r.features),
    icon_alt: bilingualImageAltFromApi(r.icon_alt ?? r.image_alt),
    ...(iconPreview ? { existing_icon_url: iconPreview } : {}),
    ...(categoryTitleAr ? { categoryTitleAr } : {}),
    ...(categoryTitleEn ? { categoryTitleEn } : {}),
  };
}

async function fillPackageCategoryFromList(
  id: string,
  values: PackageFormValues,
): Promise<PackageFormValues> {
  if (values.package_category_id && (values.categoryTitleAr || values.categoryTitleEn)) {
    return values;
  }

  try {
    const row = await fetchPackageRowById(id, "en");
    if (!row) return values;

    return {
      ...values,
      package_category_id: values.package_category_id || row.package_category_id,
      categoryTitleAr: values.categoryTitleAr || row.categoryTitle,
      categoryTitleEn: values.categoryTitleEn || row.categoryTitle,
    };
  } catch {
    return values;
  }
}

export async function fetchPackageById(id: string): Promise<PackageFormValues | null> {
  const urls = [`/v1/admin/packages/${id}`, `/v1/packages/${id}`];
  for (const url of urls) {
    try {
      const res = await api.get(url);
      const raw =
        pickPackagePayloadRecord(res.data) ??
        pickPackagePayloadRecord((res.data as { data?: unknown })?.data);
      const parsed = raw ? recordToPackageFormValues(raw) : null;
      if (parsed) return fillPackageCategoryFromList(id, parsed);
    } catch {
      /* next */
    }
  }
  const row = await fetchPackageRowById(id, "en");
  if (!row) return null;
  return {
    package_category_id: row.package_category_id,
    title: { ar: row.titleAr, en: row.titleEn },
    description: { ar: "", en: "" },
    button_text: { ar: "", en: "" },
    slug: { ar: row.slug, en: row.slug },
    is_featured: row.is_featured,
    is_active: row.is_active,
    price: "",
    currency: "",
    features: [],
    ...(row.categoryTitle ? { categoryTitleAr: row.categoryTitle, categoryTitleEn: row.categoryTitle } : {}),
  };
}
