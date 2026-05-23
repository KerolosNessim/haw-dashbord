import { api } from "@/lib/api";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
import { pickBilingualSlug, pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type { BlogCategoryFormValues, BlogCategoryRow } from "../types";

/** Laravel paginator summary from `data.meta` (snake_case → camelCase). */
export type BlogCategoryMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type BlogCategoryPage = {
  rows: BlogCategoryRow[];
  meta: BlogCategoryMeta;
};

export type BlogCategoryListParams = {
  page?: number;
  perPage?: number;
};

/**
 * Admin blog-categories aligned with Postman: list `GET ?tree=…`, create `POST` multipart,
 * update via `POST` multipart + `_method=PUT` (Laravel method spoofing) — PHP often omits multipart fields on true PUT.
 * show `GET /{id}`, delete `DELETE /{id}`, bulk delete `POST …/bulk-delete` with `ids[0]`, `ids[1]`, ….
 * Paths are relative to `API_URL` (e.g. `/v1/admin/...`).
 *
 * Postman documents CRUD only under `blog-categories` (not `blogs/categories/{id}`).
 * The latter has only an alias for bulk-delete: `POST …/blogs/categories/bulk-delete`.
 */
const ADMIN_BLOG_CATEGORIES_BASE = "/v1/admin/blog-categories";
/** Postman alias: same bulk handler only — do not use for PUT/GET/DELETE by id. */
const ADMIN_BLOGS_CATEGORIES_BULK_DELETE = "/v1/admin/blogs/categories/bulk-delete";

const BULK_DELETE_URLS = [`${ADMIN_BLOG_CATEGORIES_BASE}/bulk-delete`, ADMIN_BLOGS_CATEGORIES_BULK_DELETE] as const;

/** API may nest the model (`blog_category`, `category`). */
function unwrapBlogCategoryPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const nested = r.blog_category ?? r.category;
  if (nested && typeof nested === "object" && !Array.isArray(nested))
    return nested as Record<string, unknown>;
  return r;
}

/** Flattens `children`-nested API rows (tree=true) into a plain list for tables and selects. */
function flattenBlogCategoryTree(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const visit = (n: Record<string, unknown>) => {
    const { children: ch, ...rest } = n;
    out.push(rest);
    if (Array.isArray(ch)) {
      for (const item of ch) {
        if (item && typeof item === "object" && !Array.isArray(item))
          visit(item as Record<string, unknown>);
      }
    }
  };
  for (const r of rows) visit(r);
  return out;
}

function unwrapBlogCategoryList(payload: unknown): Record<string, unknown>[] {
  const rows = unwrapDataArray(payload);
  if (rows.length) return rows;
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const inner = p.blog_categories ?? p.categories;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
  }
  return [];
}

function normalizeBlogCategoryRecord(raw: unknown): BlogCategoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  const nameObj = r.name ?? r.title;
  const slug = pickBilingualSlug(r.slug);
  return {
    id,
    nameAr: pickLocalized(nameObj, "ar"),
    nameEn: pickLocalized(nameObj, "en"),
    slugAr: slug.ar,
    slugEn: slug.en,
    is_active: Boolean(r.is_active ?? r.isActive ?? true),
  };
}

export function normalizeBlogCategoryListPayload(payload: unknown): BlogCategoryRow[] {
  return flattenBlogCategoryTree(unwrapBlogCategoryList(payload))
    .map((row) => normalizeBlogCategoryRecord(row))
    .filter((x): x is BlogCategoryRow => x != null);
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

/** Extracts Laravel paginator `meta` from the admin blog-categories list response. */
export function pickBlogCategoryMeta(payload: unknown): BlogCategoryMeta {
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

/** Fetches a single page; current API returns `{ data: { data: [...], meta } }` (no tree). */
export async function fetchBlogCategoriesPage(
  params: BlogCategoryListParams = {},
): Promise<BlogCategoryPage> {
  const query: Record<string, string | number> = {};
  if (params.page && params.page > 0) query.page = params.page;
  if (params.perPage && params.perPage > 0) query.per_page = params.perPage;

  const res = await api.get<unknown>(ADMIN_BLOG_CATEGORIES_BASE, {
    params: Object.keys(query).length ? query : undefined,
  });

  const body = (res.data as { data?: unknown })?.data ?? res.data;
  return {
    rows: normalizeBlogCategoryListPayload(body),
    meta: pickBlogCategoryMeta(res.data),
  };
}

/**
 * Returns every blog category as a flat list (drains all pages).
 * Dropdowns and category-filter strips depend on having the full set, so we fetch
 * page 1 then in parallel pull the remaining pages reported by `meta.last_page`.
 */
export async function fetchBlogCategories(): Promise<BlogCategoryRow[]> {
  const first = await fetchBlogCategoriesPage({ page: 1 });
  if (first.meta.lastPage <= 1) return first.rows;

  const remainingPages: number[] = [];
  for (let p = 2; p <= first.meta.lastPage; p++) remainingPages.push(p);

  const rest = await Promise.all(
    remainingPages.map((p) =>
      fetchBlogCategoriesPage({ page: p, perPage: first.meta.perPage || undefined }),
    ),
  );

  return rest.reduce<BlogCategoryRow[]>((acc, page) => acc.concat(page.rows), first.rows);
}

/**
 * Postman-aligned multipart. `description[*]` may contain HTML from the rich text editor.
 */
function appendBlogCategoryFormFields(fd: FormData, values: BlogCategoryFormValues) {
  const parentTrim = values.parent_id?.trim() ?? "";
  fd.append("parent_id", parentTrim);
  fd.append("name[ar]", values.name.ar.trim());
  fd.append("name[en]", values.name.en.trim());
  appendLocalizedDescriptionHtml(fd, "description", values.description.ar, values.description.en);
  fd.append("slug[ar]", values.slug.ar.trim());
  fd.append("slug[en]", values.slug.en.trim());
  fd.append("is_active", values.is_active ? "1" : "0");
  fd.append("is_featured", values.is_featured ? "1" : "0");
  fd.append("is_searchable", values.is_searchable ? "1" : "0");
  fd.append("order_priority", String(values.order_priority ?? 0));
  fd.append("meta_title[ar]", values.meta_title.ar.trim());
  fd.append("meta_title[en]", values.meta_title.en.trim());
  fd.append("meta_description[ar]", values.meta_description.ar.trim());
  fd.append("meta_description[en]", values.meta_description.en.trim());
}

/** POST multipart — do not set Content-Type manually so axios adds the multipart boundary. */
async function createBlogCategoryRequest(values: BlogCategoryFormValues) {
  const fd = new FormData();
  appendBlogCategoryFormFields(fd, values);
  const res = await api.post(ADMIN_BLOG_CATEGORIES_BASE, fd);
  return res.data;
}

/**
 * Update is sent as POST + `_method=PUT` so PHP/Laravel receive multipart fields (they are often empty on real PUT).
 * Matches Laravel HTML forms and the same controller as Postman’s “PUT + formdata” when the server supports spoofing.
 */
async function updateBlogCategoryRequest(id: string, values: BlogCategoryFormValues) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendBlogCategoryFormFields(fd, values);
  const res = await api.post(
    `${ADMIN_BLOG_CATEGORIES_BASE}/${encodeURIComponent(id)}`,
    fd,
  );
  return res.data;
}

async function deleteBlogCategoryRequest(id: string) {
  const res = await api.delete(`${ADMIN_BLOG_CATEGORIES_BASE}/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createBlogCategory(values: BlogCategoryFormValues) {
  return createBlogCategoryRequest(values);
}

export async function updateBlogCategory(id: string, values: BlogCategoryFormValues) {
  return updateBlogCategoryRequest(id, values);
}

export async function deleteBlogCategory(id: string) {
  return deleteBlogCategoryRequest(id);
}

/**
 * Postman: POST bulk-delete with multipart fields `ids[0]`, `ids[1]`, … (not JSON `{ ids }`).
 */
async function deleteBulkWithFallback(ids: string[]) {
  let lastErr: unknown;
  for (const url of BULK_DELETE_URLS) {
    try {
      const fd = new FormData();
      ids.forEach((id, index) => {
        fd.append(`ids[${index}]`, String(id));
      });
      const res = await api.post(url, fd);
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function deleteBlogCategoriesBulk(ids: string[]) {
  return deleteBulkWithFallback(ids);
}

export function recordToBlogCategoryFormValues(raw: unknown): BlogCategoryFormValues | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const nameObj = r.name ?? r.title;
  const descObj = r.description;
  const metaTitleObj = r.meta_title;
  const metaDescObj = r.meta_description;

  let parentId = "";
  const p = r.parent_id ?? r.parent_category_id ?? r.blog_category_parent_id;
  if (typeof p === "number" || typeof p === "string") parentId = String(p).trim();
  else if (p && typeof p === "object" && !Array.isArray(p)) {
    const pid = readId(p as Record<string, unknown>);
    if (pid) parentId = pid;
  }

  const priorityRaw = r.order_priority ?? r.sort_order ?? r.display_order ?? 0;
  const priority = typeof priorityRaw === "number" ? priorityRaw : Number(priorityRaw) || 0;

  let isSearchable = true;
  const idx = r.is_searchable;
  if (idx === true || idx === 1 || idx === "1") isSearchable = true;
  else if (idx === false || idx === 0 || idx === "0") isSearchable = false;
  else {
    const noIndexRaw = r.no_index ?? r.noindex;
    if (noIndexRaw === true || noIndexRaw === 1 || noIndexRaw === "1") isSearchable = false;
    if (r.allow_indexing === false) isSearchable = false;
  }

  const isFeatured = Boolean(r.is_featured ?? r.highlighted ?? r.featured ?? false);

  return {
    name: {
      ar: pickLocalized(nameObj, "ar"),
      en: pickLocalized(nameObj, "en"),
    },
    description: {
      ar: pickLocalized(descObj, "ar"),
      en: pickLocalized(descObj, "en"),
    },
    slug: pickBilingualSlug(r.slug),
    parent_id: parentId,
    order_priority: priority,
    is_active: Boolean(r.is_active ?? true),
    is_featured: isFeatured,
    is_searchable: isSearchable,
    meta_title: {
      ar: pickLocalized(metaTitleObj, "ar"),
      en: pickLocalized(metaTitleObj, "en"),
    },
    meta_description: {
      ar: pickLocalized(metaDescObj, "ar"),
      en: pickLocalized(metaDescObj, "en"),
    },
  };
}

export async function fetchBlogCategoryById(id: string): Promise<BlogCategoryFormValues | null> {
  try {
    const res = await api.get(
      `${ADMIN_BLOG_CATEGORIES_BASE}/${encodeURIComponent(id)}`,
    );
    const envelope = (res.data as { data?: unknown })?.data ?? res.data;
    const rec = unwrapBlogCategoryPayload(envelope);
    if (rec) {
      const parsed = recordToBlogCategoryFormValues(rec);
      if (parsed) return parsed;
    }
  } catch {
    /* fall through to list fallback */
  }
  const list = await fetchBlogCategories();
  const row = list.find((c) => c.id === id);
  if (!row) return null;
  return {
    name: { ar: row.nameAr, en: row.nameEn },
    description: { ar: "", en: "" },
    slug: { ar: row.slugAr, en: row.slugEn },
    parent_id: "",
    order_priority: 0,
    is_active: row.is_active,
    is_featured: false,
    is_searchable: true,
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
  };
}
