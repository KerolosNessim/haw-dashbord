import { api } from "@/lib/api";
import { unwrapLaravelPaginated } from "@/lib/laravel-pagination";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { slugify, slugifyAr } from "@/lib/slugify";
import type { Author, AuthorFormValues, AuthorListResult, LocalizedText } from "../types";

const AUTHORS_BASE = "/v1/admin/authors";

function pickLocalized(input: unknown): LocalizedText {
  if (typeof input === "string") return { ar: input, en: input };
  if (!input || typeof input !== "object") return { ar: "", en: "" };
  const o = input as { ar?: string; en?: string };
  return { ar: o.ar ?? "", en: o.en ?? "" };
}

function pickLocalizedFromRow(row: Record<string, unknown>, ...keys: string[]): LocalizedText {
  for (const key of keys) {
    const value = row[key];
    if (value != null) return pickLocalized(value);
  }
  return { ar: "", en: "" };
}

function isLocalizedEmpty(value: LocalizedText): boolean {
  return !value.ar?.trim() && !value.en?.trim();
}

function normalizeAuthor(raw: unknown): Author {
  const row = (raw ?? {}) as Record<string, unknown>;
  const seo = (row.seo ?? {}) as Record<string, unknown>;
  const imageAlt = (row.imageAlt ?? {}) as Record<string, unknown>;
  const localizedImageAlt = pickLocalizedFromRow(row, "image_alt", "imageAlt", "alt", "alt_text");
  const localizedMetaTitle = pickLocalizedFromRow(row, "meta_title", "metaTitle", "seo_title");
  const localizedMetaDescription = pickLocalizedFromRow(
    row,
    "meta_description",
    "metaDescription",
    "seo_description",
  );
  return {
    id: Number(row.id ?? 0),
    image:
      typeof row.image === "string"
        ? row.image
        : typeof row.image_url === "string"
          ? row.image_url
          : null,
    name: pickLocalizedFromRow(row, "name"),
    job_title: pickLocalizedFromRow(row, "job_title", "jobTitle"),
    bio: pickLocalizedFromRow(row, "bio"),
    image_alt: isLocalizedEmpty(localizedImageAlt) ? pickLocalized(imageAlt) : localizedImageAlt,
    slug: pickLocalizedFromRow(row, "slug", "seo_slug"),
    meta_title: isLocalizedEmpty(localizedMetaTitle) ? pickLocalized(seo.meta_title) : localizedMetaTitle,
    meta_description: isLocalizedEmpty(localizedMetaDescription)
      ? pickLocalized(seo.meta_description)
      : localizedMetaDescription,
    is_active: Boolean(row.is_active ?? true),
  };
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.authors)) return nested.authors;
  }
  if (Array.isArray(root.authors)) return root.authors;
  return [];
}

export async function fetchAuthors(params?: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<AuthorListResult> {
  const res = await api.get(AUTHORS_BASE, {
    params: {
      ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.perPage ? { per_page: params.perPage } : {}),
    },
  });

  const paged = unwrapLaravelPaginated<unknown>(res.data);
  if (paged) {
    return {
      rows: paged.data.map(normalizeAuthor).filter((a) => a.id > 0),
      meta: {
        current_page: paged.meta.current_page,
        last_page: paged.meta.last_page,
        per_page: paged.meta.per_page,
        total: paged.meta.total,
        from: paged.meta.from,
        to: paged.meta.to,
        path: paged.meta.path,
      },
    };
  }

  const rows = extractRows(res.data).map(normalizeAuthor).filter((a) => a.id > 0);
  return {
    rows,
    meta: {
      current_page: params?.page ?? 1,
      last_page: 1,
      per_page: rows.length || params?.perPage || 10,
      total: rows.length,
      from: rows.length ? 1 : null,
      to: rows.length || null,
      path: AUTHORS_BASE,
    },
  };
}

function valuesToFormData(values: AuthorFormValues, imageFile: File | null, mode: "create" | "update") {
  const fd = new FormData();
  if (mode === "update") fd.append("_method", "PUT");

  fd.append("name[ar]", values.name.ar.trim());
  fd.append("name[en]", values.name.en.trim());
  fd.append("job_title[ar]", values.job_title.ar.trim());
  fd.append("job_title[en]", values.job_title.en.trim());
  fd.append("bio[ar]", localizedHtmlForApi(values.bio.ar));
  fd.append("bio[en]", localizedHtmlForApi(values.bio.en));

  fd.append("image_alt[ar]", values.image_alt.ar.trim());
  fd.append("image_alt[en]", values.image_alt.en.trim());

  fd.append("slug[ar]", slugifyAr(values.slug.ar));
  fd.append("slug[en]", slugify(values.slug.en));

  fd.append("meta_title[ar]", values.meta_title.ar.trim());
  fd.append("meta_title[en]", values.meta_title.en.trim());
  fd.append("meta_description[ar]", values.meta_description.ar.trim());
  fd.append("meta_description[en]", values.meta_description.en.trim());

  fd.append("is_active", values.is_active ? "1" : "0");
  if (imageFile) fd.append("image", imageFile);
  return fd;
}

export async function createAuthor(values: AuthorFormValues, imageFile: File | null) {
  const fd = valuesToFormData(values, imageFile, "create");
  const res = await api.post(AUTHORS_BASE, fd);
  return res.data;
}

export async function updateAuthor(id: number, values: AuthorFormValues, imageFile: File | null) {
  const fd = valuesToFormData(values, imageFile, "update");
  const res = await api.post(`${AUTHORS_BASE}/${id}`, fd);
  return res.data;
}

export async function deleteAuthor(id: number) {
  const res = await api.delete(`${AUTHORS_BASE}/${id}`);
  return res.data;
}
