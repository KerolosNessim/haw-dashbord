import { api } from "@/lib/api";
import { pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type { IconPreset, PackageFormValues, PackageRow } from "../types";

function apiOriginFromEnv(): string {
  const raw = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  if (!raw) return "";
  return raw.replace(/\/?api$/i, "");
}

/** Build absolute URL for media paths returned by the backend (dashboard). */
function resolveUploadedMediaUrl(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const path = raw.trim();
  if (/^https?:\/\//i.test(path)) return path;
  const origin = apiOriginFromEnv();
  if (!origin) return path;
  if (path.startsWith("/")) return `${origin}${path}`;
  return `${origin}/${path}`;
}

function resolvePackageIconPreview(r: Record<string, unknown>): string {
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

function parseIconPreset(raw: unknown): IconPreset {
  if (typeof raw !== "string" || !raw.trim()) return "none";
  const s = raw.trim().toLowerCase();
  if (s === "target" || s === "gem" || s === "rocket") return s;
  return "none";
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
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
  const title = rec.title;
  if ((typeof id === "number" || typeof id === "string") && title != null) return rec;

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

function normalizePackageRecord(raw: unknown, locale: "ar" | "en" = "en"): PackageRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  const pkgCat =
    r.package_category ??
    r.category ??
    (typeof r.package_category_id === "object" ? r.package_category_id : null);

  const categoryIdRaw =
    r.package_category_id ??
    (pkgCat && typeof pkgCat === "object"
      ? (pkgCat as Record<string, unknown>).id
      : undefined);
  const categoryId = categoryIdRaw != null ? String(categoryIdRaw) : "";

  return {
    id,
    titleAr: pickLocalized(r.title, "ar"),
    titleEn: pickLocalized(r.title, "en"),
    slug: typeof r.slug === "string" ? r.slug : "",
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

export async function fetchPackages(locale: "ar" | "en"): Promise<PackageRow[]> {
  const urls = ["/v1/admin/packages", "/v1/packages"];
  let lastErr: unknown;
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url);
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return normalizePackageListPayload(body, locale);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function appendLocalized(fd: FormData, prefix: string, value: { ar: string; en: string }) {
  fd.append(`${prefix}[ar]`, value.ar);
  fd.append(`${prefix}[en]`, value.en);
}

export function packageValuesToFormData(values: PackageFormValues, iconFile: File | null): FormData {
  const { existing_icon_url: _preview, ...v } = values;
  void _preview;

  const fd = new FormData();
  fd.append("package_category_id", v.package_category_id);
  appendLocalized(fd, "title", v.title);
  appendLocalized(fd, "description", v.description);
  appendLocalized(fd, "button_text", v.button_text);

  fd.append("is_featured", v.is_featured ? "1" : "0");
  fd.append("is_active", v.is_active ? "1" : "0");
  if (v.price.trim()) fd.append("price", v.price.trim());
  if (v.currency.trim()) fd.append("currency", v.currency.trim());

  if (v.slug.trim()) fd.append("slug", v.slug.trim());
  if (v.details_url.trim()) fd.append("details_url", v.details_url.trim());
  if (v.canonical_url.trim()) fd.append("canonical_url", v.canonical_url.trim());

  appendLocalized(fd, "meta_title", v.meta_title);
  appendLocalized(fd, "meta_description", v.meta_description);
  appendLocalized(fd, "meta_keywords", v.meta_keywords);

  if (v.icon_preset !== "none" && iconFile == null) {
    fd.append("icon_preset", v.icon_preset);
  }
  if (iconFile instanceof File) {
    fd.append("icon", iconFile);
  }

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
export async function updatePackage(packageId: string, values: PackageFormValues, iconFile: File | null) {
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
  const pkgCat = r.package_category ?? r.category;
  let categoryId = "";
  if (typeof r.package_category_id === "string" || typeof r.package_category_id === "number") {
    categoryId = String(r.package_category_id);
  } else if (pkgCat && typeof pkgCat === "object") {
    const id = (pkgCat as Record<string, unknown>).id;
    if (id != null) categoryId = String(id);
  }

  const iconPreview = resolvePackageIconPreview(r);
  const preset = parseIconPreset(r.icon_preset);
  const resolvedPreset: IconPreset = iconPreview ? "none" : preset === "none" ? "none" : preset;

  return {
    package_category_id: categoryId,
    title: { ar: pickLocalized(r.title, "ar"), en: pickLocalized(r.title, "en") },
    description: {
      ar: pickLocalized(r.description, "ar"),
      en: pickLocalized(r.description, "en"),
    },
    button_text: {
      ar: pickLocalized(r.button_text ?? r.cta_label, "ar"),
      en: pickLocalized(r.button_text ?? r.cta_label, "en"),
    },
    details_url: typeof r.details_url === "string" ? r.details_url : "",
    slug: typeof r.slug === "string" ? r.slug : "",
    canonical_url: typeof r.canonical_url === "string" ? r.canonical_url : "",
    is_featured: Boolean(r.is_featured ?? r.is_popular ?? false),
    is_active: Boolean(r.is_active ?? true),
    price: r.price != null ? String(r.price) : "",
    currency: typeof r.currency === "string" ? r.currency : "",
    icon_preset: resolvedPreset,
    meta_title: {
      ar: pickLocalized(r.meta_title, "ar"),
      en: pickLocalized(r.meta_title, "en"),
    },
    meta_description: {
      ar: pickLocalized(r.meta_description, "ar"),
      en: pickLocalized(r.meta_description, "en"),
    },
    meta_keywords: {
      ar: pickLocalized(r.meta_keywords, "ar"),
      en: pickLocalized(r.meta_keywords, "en"),
    },
    features: parseFeatures(r.features),
    ...(iconPreview ? { existing_icon_url: iconPreview } : {}),
  };
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
      if (parsed) return parsed;
    } catch {
      /* next */
    }
  }
  const list = await fetchPackages("en");
  const row = list.find((p) => p.id === id);
  if (!row) return null;
  return {
    package_category_id: row.package_category_id,
    title: { ar: row.titleAr, en: row.titleEn },
    description: { ar: "", en: "" },
    button_text: { ar: "", en: "" },
    details_url: "",
    slug: row.slug,
    canonical_url: "",
    is_featured: row.is_featured,
    is_active: row.is_active,
    price: "",
    currency: "",
    icon_preset: "none",
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    meta_keywords: { ar: "", en: "" },
    features: [],
  };
}
