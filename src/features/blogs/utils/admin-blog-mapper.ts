import { blogTagNames, normalizeBlogTagsFromApi } from "@/features/blogs/lib/blog-tags";
import { unwrapDataArray } from "@/lib/api-payload";

export type BlogStatus = "draft" | "published" | "scheduled";

export type AdminBlogRow = {
  id: string | number;
  title: string;
  subtitle: string;
  category: string;
  categoryId: string;
  publisher: string;
  tags: string[];
  views: number;
  isActive: boolean;
  status: BlogStatus;
  createdAt: string;
  publishedAt: string;
  imageUrl: string | null;
  slug: string;
};

/** Aggregated counts from `data.statistics` in the admin blogs list response. */
export type AdminBlogStatistics = {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
};

/** Laravel paginator summary from `data.meta` in the admin blogs list response. */
export type AdminBlogMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function localizedText(v: unknown, localePrefix: string): string {
  if (typeof v === "string") return v;
  const o = asRecord(v);
  if (!o) return "";
  const ar = o.ar;
  const en = o.en;
  const locAr = localePrefix.startsWith("ar");
  if (locAr && typeof ar === "string") return ar;
  if (typeof en === "string") return en;
  if (typeof ar === "string") return ar;
  return "";
}

function pickCategoryId(blog: Record<string, unknown>): string {
  if (blog.blog_category_id != null && blog.blog_category_id !== "") return String(blog.blog_category_id);
  if (blog.category_id != null && blog.category_id !== "") return String(blog.category_id);
  const rec = asRecord(blog.category);
  if (rec?.id != null) return String(rec.id);
  return "";
}

function pickCategory(blog: Record<string, unknown>, locale: string): string {
  const cat = blog.category;
  const rec = asRecord(cat);
  if (rec) {
    const nameObj = rec.name ?? rec.title;
    const name = localizedText(nameObj, locale);
    if (name) return name;
    if (typeof rec.name === "string") return rec.name;
  }
  if (typeof blog.category_name === "string") return blog.category_name;
  return "";
}

function pickTags(blog: Record<string, unknown>): string[] {
  return blogTagNames(normalizeBlogTagsFromApi(blog.tags));
}

function pickStatus(raw: unknown): BlogStatus {
  if (raw === "published" || raw === "draft" || raw === "scheduled") return raw;
  return "draft";
}

/**
 * Accepts every shape the admin/public blog list endpoints have used over time:
 * - current admin: `{ data: { blogs: [], statistics, meta } }`
 * - legacy admin / public: `{ data: [] }`, `{ blogs: [] }`, `{ data: { data: [] } }`, or bare array.
 */
export function normalizeAdminBlogListPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const root = asRecord(payload);
  if (root) {
    const dataRec = asRecord(root.data);
    if (dataRec && Array.isArray(dataRec.blogs)) return dataRec.blogs;
    if (dataRec && Array.isArray(dataRec.data)) return dataRec.data;
    if (Array.isArray(root.data)) return root.data;
    if (Array.isArray(root.blogs)) return root.blogs;
  }

  const rows = unwrapDataArray(payload);
  if (rows.length > 0) return rows as unknown[];

  return [];
}

function toFiniteNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Extracts `data.statistics` from the admin blogs list response (defaults to zeros). */
export function pickAdminBlogStatistics(payload: unknown): AdminBlogStatistics {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const stats = asRecord(dataRec?.statistics) ?? asRecord(root?.statistics);
  return {
    total: toFiniteNumber(stats?.total),
    published: toFiniteNumber(stats?.published),
    draft: toFiniteNumber(stats?.draft),
    scheduled: toFiniteNumber(stats?.scheduled),
  };
}

/** Extracts `data.meta` (Laravel paginator) from the admin blogs list response. */
export function pickAdminBlogMeta(payload: unknown): AdminBlogMeta {
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

export function blogRecordToRow(blog: unknown, locale: string): AdminBlogRow | null {
  const rec = asRecord(blog);
  if (!rec) return null;
  const id = rec.id;
  if (id == null || (typeof id !== "number" && typeof id !== "string")) return null;

  const titleRaw = localizedText(rec.title, locale);
  const subtitleVal =
    typeof rec.subtitle === "string" ? rec.subtitle : localizedText(rec.subtitle, locale);

  const views = typeof rec.views === "number" ? rec.views : Number(rec.views) || 0;
  let isActive = true;
  if (typeof rec.is_active === "boolean") isActive = rec.is_active;
  else if (rec.is_active === 0 || rec.is_active === "0") isActive = false;
  else if (rec.active === false) isActive = false;

  const created =
    typeof rec.created_at === "string"
      ? rec.created_at
      : typeof rec.createdAt === "string"
        ? rec.createdAt
        : "";
  const published =
    typeof rec.published_at === "string"
      ? rec.published_at
      : typeof rec.publishedAt === "string"
        ? rec.publishedAt
        : "";

  const imgRecord = asRecord(rec.image);
  const img =
    typeof rec.image === "string"
      ? rec.image
      : imgRecord && typeof imgRecord.url === "string"
        ? imgRecord.url
        : typeof rec.image_url === "string"
          ? rec.image_url
          : null;

  const publisher =
    typeof rec.publisher_name === "string"
      ? rec.publisher_name
      : typeof rec.publisher === "string"
        ? rec.publisher
        : asRecord(rec.publisher)?.name != null && typeof asRecord(rec.publisher)!.name === "string"
          ? (asRecord(rec.publisher)!.name as string)
          : "";

  return {
    id,
    title: titleRaw || "—",
    subtitle: subtitleVal || "—",
    category: pickCategory(rec, locale) || "—",
    categoryId: pickCategoryId(rec),
    publisher: publisher || "—",
    tags: pickTags(rec),
    views,
    isActive,
    status: pickStatus(rec.status),
    createdAt: created || "—",
    publishedAt: published,
    imageUrl: img,
    slug: localizedText(rec.slug, locale),
  };
}
