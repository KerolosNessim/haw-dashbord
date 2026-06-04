import { api } from "@/lib/api";
import {
  appendCountryIdsToFormData,
  countryIdsQuery,
} from "@/features/home-content/lib/country-scope";
import { parseCountryIdsFromApi } from "@/features/shared/lib/parse-country-ids";
import {
  appendLocalizedDescriptionHtml,
  localizedHtmlForApi,
} from "@/lib/localized-html-form";
import type { BlogFormValues } from "@/features/blogs/blog-form-schema";
import {
  BLOG_TOC_PLACEMENTS,
  DEFAULT_BLOG_TOC_HTML,
  DEFAULT_BLOG_TOC_PLACEMENT,
} from "@/features/blogs/lib/default-blog-toc";
import { appendBlogTagsToFormData, normalizeBlogTagsFromApi } from "@/features/blogs/lib/blog-tags";
import { assertApiEnvelopeSuccess, pickBilingualSlug, pickLocalized } from "@/lib/api-payload";
import {
  appendDeleteSlugRedirectToFormData,
  type DeleteSlugRedirectPayload,
} from "@/lib/delete-slug-redirect";
import { normalizeSlugRedirectCodeInput } from "@/lib/http-redirect-codes";
import { isAxiosError } from "axios";

const ADMIN_BLOGS_BASE = "/v1/admin/blogs";

/** Public list — same item shape as many admin list APIs; used as fallback when admin route errors. */
const PUBLIC_BLOGS_LIST = "/v1/blogs";

function shouldTryPublicBlogsFallback(error: unknown): boolean {
  if (!import.meta.env.DEV && import.meta.env.VITE_USE_PUBLIC_BLOGS_FALLBACK !== "true") return false;
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 404 || status === 500 || status === 502 || status === 503;
}

function shouldTryPublicBlogShowFallback(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 403 || status === 404 || status === 500 || status === 502 || status === 503;
}

/** API format `Y-m-d H:i:s` ↔ browser `datetime-local` `Y-m-dTHH:mm`. */
function publishedAtApiToLocal(api: string): string {
  const t = api.trim();
  if (!t) return "";
  const m = t.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return "";
  return `${m[1]}T${m[2]}:${m[3]}`;
}

function publishedAtLocalToApi(local: string): string {
  const t = local.trim();
  if (!t) return "";
  const withSpace = t.includes("T") ? t.replace("T", " ") : t;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(withSpace)) return `${withSpace}:00`;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(withSpace)) return withSpace;
  return withSpace;
}

/**
 * Multipart for admin blog create/update (Postman: same keys for POST create and PUT update).
 * Update is sent as POST + `_method=PUT` so Laravel receives nested fields reliably.
 */
export function blogValuesToFormData(
  values: BlogFormValues,
  imageFile: File | null,
  mode: "create" | "update",
): FormData {
  const fd = new FormData();
  appendCountryIdsToFormData(fd, values.country_ids);

  if (mode === "update") {
    fd.append("_method", "PUT");
  }

  fd.append("blog_category_id", values.category_id.trim());
  fd.append("author_id", values.author_id?.trim() ?? "");

  fd.append("title[ar]", values.title.ar.trim());
  fd.append("title[en]", values.title.en.trim());

  fd.append("subtitle[ar]", values.subtitle.ar ?? "");
  fd.append("subtitle[en]", values.subtitle.en ?? "");

  appendLocalizedDescriptionHtml(fd, "description", values.description.ar, values.description.en);

  fd.append("content[ar]", localizedHtmlForApi(values.content.ar));
  fd.append("content[en]", localizedHtmlForApi(values.content.en));

  const appendFaq = (locale: "ar" | "en") => {
    const rows = Array.isArray(values.faq?.[locale]) ? values.faq[locale] : [];
    rows
      .map((item) => ({
        question: localizedHtmlForApi(item?.question ?? ""),
        answer: localizedHtmlForApi(item?.answer ?? ""),
      }))
      .filter((item) => item.question || item.answer)
      .forEach((item, index) => {
        fd.append(`faq[${locale}][${index}][question]`, item.question);
        fd.append(`faq[${locale}][${index}][answer]`, item.answer);
      });
  };
  appendFaq("ar");
  appendFaq("en");

  fd.append("toc_enabled", values.toc_enabled ? "1" : "0");
  fd.append("toc_placement", values.toc_placement);
  fd.append("table_of_contents[ar]", localizedHtmlForApi(values.table_of_contents.ar));
  fd.append("table_of_contents[en]", localizedHtmlForApi(values.table_of_contents.en));

  fd.append("slug[ar]", (values.slug.ar ?? "").trim());
  fd.append("slug[en]", (values.slug.en ?? "").trim());

  fd.append("slug_redirect_code[ar]", values.slug_redirect_code.ar ?? "");
  fd.append("slug_redirect_code[en]", values.slug_redirect_code.en ?? "");

  fd.append("canonical_url", (values.canonical_url ?? "").trim());

  fd.append("meta_title[ar]", values.meta_title.ar ?? "");
  fd.append("meta_title[en]", values.meta_title.en ?? "");
  fd.append("meta_description[ar]", values.meta_description.ar ?? "");
  fd.append("meta_description[en]", values.meta_description.en ?? "");

  fd.append("image_alt[ar]", values.image_alt.ar ?? "");
  fd.append("image_alt[en]", values.image_alt.en ?? "");

  // `publisher_name` is now derived from selected author on backend side.
  fd.append("publisher_name", (values.publisher_name ?? "").trim());
  fd.append("status", values.status);
  fd.append("is_active", values.is_active ? "1" : "0");
  fd.append("is_searchable", values.is_searchable ? "1" : "0");

  fd.append("published_at", publishedAtLocalToApi(values.published_at));

  appendBlogTagsToFormData(fd, values.tags);

  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  }

  return fd;
}

export async function createBlog(values: BlogFormValues, imageFile: File | null) {
  const formData = blogValuesToFormData(values, imageFile, "create");
  const res = await api.post(ADMIN_BLOGS_BASE, formData);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function updateBlog(
  blogId: string | number,
  values: BlogFormValues,
  imageFile: File | null,
) {
  const formData = blogValuesToFormData(values, imageFile, "update");
  const res = await api.post(`${ADMIN_BLOGS_BASE}/${blogId}`, formData);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function fetchAdminBlogs(params?: Record<string, string | number | undefined>) {
  try {
    const res = await api.get<unknown>(ADMIN_BLOGS_BASE, { params });
    return res.data;
  } catch (e) {
    if (!shouldTryPublicBlogsFallback(e)) throw e;
    try {
      const res = await api.get<unknown>(PUBLIC_BLOGS_LIST, { params });
      return res.data;
    } catch {
      throw e;
    }
  }
}

function unwrapBlogShowPayloadEnvelope(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    if (payload.length === 1 && payload[0] && typeof payload[0] === "object")
      return payload[0];
    return payload;
  }
  return payload;
}

/**
 * Show endpoints sometimes return `{ ..., blog_category_id, blog: { title, … } }`. Taking only `blog`
 * drops top-level category ids — merge so category fields from either level are kept.
 */
function mergeBlogShowPayload(raw: unknown): unknown {
  const top = asRecord(raw);
  if (!top) return raw;
  const nested = asRecord(top.blog) ?? asRecord(top.blog_post);
  if (!nested) return raw;
  return {
    ...nested,
    ...top,
    blog_category_id: coalesceIdField(top.blog_category_id, nested.blog_category_id),
    category_id: coalesceIdField(top.category_id, nested.category_id),
    author_id: coalesceIdField(top.author_id, nested.author_id),
    category: top.category ?? nested.category,
    blog_category: top.blog_category ?? nested.blog_category,
    author: top.author ?? nested.author,
  };
}

function coalesceIdField(a: unknown, b: unknown): unknown {
  const aOk = a != null && String(a).trim() !== "";
  const bOk = b != null && String(b).trim() !== "";
  if (aOk) return a;
  if (bOk) return b;
  return a ?? b;
}

async function fetchPublicBlogById(blogId: string | number) {
  const res = await api.get<unknown>(`${PUBLIC_BLOGS_LIST}/${blogId}`);
  assertApiEnvelopeSuccess(res.data);
  const payload: unknown = (res.data as { data?: unknown })?.data ?? res.data;
  return unwrapBlogShowPayloadEnvelope(payload);
}

export async function fetchAdminBlogById(blogId: string | number) {
  try {
    const res = await api.get<unknown>(`${ADMIN_BLOGS_BASE}/${blogId}`);
    assertApiEnvelopeSuccess(res.data);
    const payload: unknown = (res.data as { data?: unknown })?.data ?? res.data;
    return unwrapBlogShowPayloadEnvelope(payload);
  } catch (error) {
    if (shouldTryPublicBlogShowFallback(error) || shouldTryPublicBlogsFallback(error)) {
      return fetchPublicBlogById(blogId);
    }
    throw error;
  }
}

export async function deleteBlog(
  blogId: string | number,
  payload: DeleteSlugRedirectPayload,
) {
  const res = await api.delete(`${ADMIN_BLOGS_BASE}/${blogId}`, { data: payload });
  return res.data;
}

/** Bulk delete — Postman: `POST …/bulk-delete` with multipart `ids[0]`, `ids[1]`, … */
export async function deleteBlogsBulk(
  ids: (string | number)[],
  payload: DeleteSlugRedirectPayload,
) {
  const fd = new FormData();
  ids.forEach((id, index) => {
    fd.append(`ids[${index}]`, String(id));
  });
  appendDeleteSlugRedirectToFormData(fd, payload);
  const res = await api.post(`${ADMIN_BLOGS_BASE}/bulk-delete`, fd);
  return res.data;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickBilingualSlugRedirectCode(rec: Record<string, unknown>): { ar: string; en: string } {
  const raw = rec.slug_redirect_code ?? rec.slugRedirectCode;
  if (raw != null) {
    return {
      ar: normalizeSlugRedirectCodeInput(pickLocalized(raw, "ar")),
      en: normalizeSlugRedirectCodeInput(pickLocalized(raw, "en")),
    };
  }
  return {
    ar: normalizeSlugRedirectCodeInput(rec.slug_redirect_code_ar ?? rec.slugRedirectCodeAr),
    en: normalizeSlugRedirectCodeInput(rec.slug_redirect_code_en ?? rec.slugRedirectCodeEn),
  };
}

function pickBilingualImageAlt(raw: unknown): { ar: string; en: string } {
  if (raw == null) return { ar: "", en: "" };
  if (typeof raw === "string") {
    const t = raw.trim();
    return { ar: t, en: t };
  }
  return {
    ar: pickLocalized(raw, "ar").trim(),
    en: pickLocalized(raw, "en").trim(),
  };
}

/** Same cues as admin list mapper — Laravel may use ids on the row or nested `category` / `blog_category`. */
function pickBlogFormCategoryId(rec: Record<string, unknown>): string {
  for (const k of ["blog_category_id", "category_id", "blogCategoryId", "categoryId"] as const) {
    const v = rec[k];
    if (v != null && v !== "") {
      const s = String(v).trim();
      if (s) return s;
    }
  }
  const catPrimitive = rec.category;
  if (typeof catPrimitive === "number" && Number.isFinite(catPrimitive)) return String(catPrimitive);
  if (typeof catPrimitive === "string" && /^\d+$/.test(catPrimitive.trim())) return catPrimitive.trim();
  for (const key of ["blog_category", "category"] as const) {
    const o = asRecord(rec[key]);
    if (!o) continue;
    const wrapped = asRecord(o.data);
    const id = wrapped?.id ?? o.id;
    if (id != null && String(id).trim() !== "") return String(id).trim();
  }
  return "";
}

function parseBlogTocPlacement(rec: Record<string, unknown>): (typeof BLOG_TOC_PLACEMENTS)[number] {
  const raw = rec.toc_placement ?? rec.tocPlacement;
  const s = typeof raw === "string" ? raw.trim() : "";
  if ((BLOG_TOC_PLACEMENTS as readonly string[]).includes(s)) {
    return s as (typeof BLOG_TOC_PLACEMENTS)[number];
  }
  return DEFAULT_BLOG_TOC_PLACEMENT;
}

function parseBlogTocEnabled(rec: Record<string, unknown>): boolean {
  const v = rec.toc_enabled ?? rec.tocEnabled;
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  return false;
}

function parseBlogIsSearchable(rec: Record<string, unknown>): boolean {
  const v = rec.is_searchable;
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  const noIndex = rec.no_index ?? rec.noindex ?? rec.is_noindex;
  if (noIndex === true || noIndex === 1 || noIndex === "1") return false;
  if (rec.allow_indexing === false) return false;
  if (rec.indexable === false) return false;
  return true;
}

type BlogFaqItem = { question: string; answer: string };

function parseFaqItems(raw: unknown): BlogFaqItem[] {
  if (!Array.isArray(raw)) {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const one = raw as Record<string, unknown>;
      const q = typeof one.question === "string" ? one.question.trim() : "";
      const a = typeof one.answer === "string" ? one.answer.trim() : "";
      if (q || a) return [{ question: q, answer: a }];
    }
    return [];
  }
  return raw
    .map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return null;
      const item = row as Record<string, unknown>;
      const question = typeof item.question === "string" ? item.question.trim() : "";
      const answer = typeof item.answer === "string" ? item.answer.trim() : "";
      if (!question && !answer) return null;
      return { question, answer };
    })
    .filter((v): v is BlogFaqItem => v != null);
}

function pickLocalizedFaq(raw: unknown): { ar: BlogFaqItem[]; en: BlogFaqItem[] } {
  if (raw == null) return { ar: [], en: [] };
  if (typeof raw === "string") return { ar: [], en: [] };
  if (Array.isArray(raw)) {
    const items = parseFaqItems(raw);
    return { ar: items, en: items };
  }
  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    const ar = parseFaqItems(rec.ar);
    const en = parseFaqItems(rec.en);
    return { ar, en };
  }
  return { ar: [], en: [] };
}

/** Maps a single admin blog API record into the BlogForm values shape. */
export function recordToBlogFormValues(raw: unknown): BlogFormValues | null {
  const rec = asRecord(mergeBlogShowPayload(raw));
  if (!rec) return null;

  const tags = normalizeBlogTagsFromApi(rec.tags);

  const categoryId = pickBlogFormCategoryId(rec);
  const authorId = (() => {
    for (const key of ["author_id", "authorId"] as const) {
      const value = rec[key];
      if (value != null && String(value).trim() !== "") return String(value).trim();
    }
    const authorRec = asRecord(rec.author);
    if (authorRec?.id != null && String(authorRec.id).trim() !== "") return String(authorRec.id).trim();
    return "";
  })();

  const status = (() => {
    const s = rec.status;
    if (s === "published" || s === "draft" || s === "scheduled") return s;
    return "draft" as const;
  })();

  const isSearchable = parseBlogIsSearchable(rec);

  const publishedRaw =
    typeof rec.published_at === "string"
      ? rec.published_at
      : typeof rec.publishedAt === "string"
        ? rec.publishedAt
        : "";

  return {
    title: {
      ar: pickLocalized(rec.title, "ar"),
      en: pickLocalized(rec.title, "en"),
    },
    subtitle: {
      ar: pickLocalized(rec.subtitle, "ar"),
      en: pickLocalized(rec.subtitle, "en"),
    },
    description: {
      ar: pickLocalized(rec.description, "ar"),
      en: pickLocalized(rec.description, "en"),
    },
    content: {
      ar: pickLocalized(rec.content, "ar"),
      en: pickLocalized(rec.content, "en"),
    },
    faq: pickLocalizedFaq(rec.faq),
    toc_enabled: parseBlogTocEnabled(rec),
    toc_placement: parseBlogTocPlacement(rec),
    table_of_contents: {
      ar: pickLocalized(rec.table_of_contents, "ar") || DEFAULT_BLOG_TOC_HTML.ar,
      en: pickLocalized(rec.table_of_contents, "en") || DEFAULT_BLOG_TOC_HTML.en,
    },
    tags,
    category_id: categoryId,
    author_id: authorId,
    image_alt: pickBilingualImageAlt(rec.image_alt),
    is_active: rec.is_active === false || rec.is_active === 0 || rec.is_active === "0" ? false : true,
    is_searchable: isSearchable,
    slug: pickBilingualSlug(rec.slug),
    slug_redirect_code: pickBilingualSlugRedirectCode(rec),
    canonical_url: typeof rec.canonical_url === "string" ? rec.canonical_url : "",
    status,
    meta_title: {
      ar: pickLocalized(rec.meta_title, "ar"),
      en: pickLocalized(rec.meta_title, "en"),
    },
    meta_description: {
      ar: pickLocalized(rec.meta_description, "ar"),
      en: pickLocalized(rec.meta_description, "en"),
    },
    published_at: publishedAtApiToLocal(publishedRaw),
    country_ids: parseCountryIdsFromApi(rec),
  };
}
