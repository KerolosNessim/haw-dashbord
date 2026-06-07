import { api } from "@/lib/api";
import { unwrapLaravelPaginated } from "@/lib/laravel-pagination";
import { pickImageUrlFromUnknown, pickLocalizedImageUrls } from "@/lib/resolve-media-url";
import { slugify, slugifyAr } from "@/lib/slugify";
import type {
  JobApplication,
  JobApplicationListResult,
  JobOpening,
  JobsHeader,
  JobsHeaderFormValues,
  JobsSection,
  JobsSectionFormValues,
  LocalizedText,
  JobOpeningFormValues,
} from "../types";

const JOBS_BASE = "/v1/admin/jobs";

function pickLocalized(input: unknown): LocalizedText {
  if (typeof input === "string") return { ar: input, en: input };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ar: "", en: "" };
  const row = input as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : "",
    en: typeof row.en === "string" ? row.en : "",
  };
}

function pickLocalizedFromRow(row: Record<string, unknown>, ...keys: string[]): LocalizedText {
  for (const key of keys) {
    const value = row[key];
    if (value != null) return pickLocalized(value);
  }
  const ar = row.ar ?? row[`${keys[0]}_ar`] ?? row[`${keys[0]}Ar`];
  const en = row.en ?? row[`${keys[0]}_en`] ?? row[`${keys[0]}En`];
  return {
    ar: typeof ar === "string" ? ar : "",
    en: typeof en === "string" ? en : "",
  };
}

function pickLocalizedImageFromRow(row: Record<string, unknown>, ...keys: string[]): { ar: string | null; en: string | null } {
  const media = row.media;
  if (media && typeof media === "object" && !Array.isArray(media)) {
    const mediaRow = media as Record<string, unknown>;
    const fromMedia = pickLocalizedImageUrls(mediaRow.image, mediaRow.images);
    if (fromMedia.ar || fromMedia.en) return fromMedia;
  }

  for (const key of keys) {
    const value = row[key];
    if (value == null) continue;
    const localized = pickLocalizedImageUrls(value, key === "image" ? row.images : undefined);
    if (localized.ar || localized.en) return localized;
  }

  const ar =
    pickImageUrlFromUnknown(row.image_ar) ??
    pickImageUrlFromUnknown(row.imageAr) ??
    pickImageUrlFromUnknown(row.ar_image) ??
    pickImageUrlFromUnknown(row.arImage) ??
    pickImageUrlFromUnknown(row.image_ar_url);

  const en =
    pickImageUrlFromUnknown(row.image_en) ??
    pickImageUrlFromUnknown(row.imageEn) ??
    pickImageUrlFromUnknown(row.en_image) ??
    pickImageUrlFromUnknown(row.enImage) ??
    pickImageUrlFromUnknown(row.image_en_url);

  if (ar || en) return { ar, en };

  const image =
    pickImageUrlFromUnknown(row.image) ??
    pickImageUrlFromUnknown(row.image_url) ??
    pickImageUrlFromUnknown(row.imageUrl);
  return { ar: image, en: image };
}

function extractPayload(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in data) {
    const payload = (data as { data?: unknown }).data;
    if (payload != null) return payload;
  }
  return data;
}

function normalizeHeader(input: unknown): JobsHeader {
  const row = (extractPayload(input) ?? {}) as Record<string, unknown>;
  return {
    id: typeof row.id === "number" ? row.id : undefined,
    title: pickLocalized(row.title),
    description: pickLocalized(row.description),
    meta_title: pickLocalized(row.meta_title),
    meta_description: pickLocalized(row.meta_description),
    image_alt: pickLocalizedFromRow(row, "image_alt", "imageAlt", "alt", "alt_text"),
    image: pickLocalizedImageFromRow(row, "image", "cover", "media_url_cover"),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
  };
}

function normalizeSection(input: unknown): JobsSection {
  const row = (input ?? {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  return {
    id: Number(row.id ?? 0),
    section_type: typeof row.section_type === "string" ? row.section_type : "",
    name: pickLocalizedFromRow(row, "name"),
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    items: itemsRaw.map((item, index) => {
      const itemRow = (item ?? {}) as Record<string, unknown>;
      return {
        id: typeof itemRow.id === "number" ? itemRow.id : undefined,
        title: pickLocalizedFromRow(itemRow, "title"),
        description: pickLocalizedFromRow(itemRow, "description"),
        image_alt: pickLocalizedFromRow(itemRow, "image_alt", "imageAlt", "alt", "alt_text"),
        image: pickLocalizedImageFromRow(itemRow, "image", "cover"),
        sort_order: Number(itemRow.sort_order ?? index),
      };
    }),
  };
}

function normalizeOpening(input: unknown): JobOpening {
  const row = (input ?? {}) as Record<string, unknown>;
  return {
    id: Number(row.id ?? 0),
    title: pickLocalizedFromRow(row, "title"),
    slug: pickLocalizedFromRow(row, "slug"),
    description: pickLocalizedFromRow(row, "description"),
    job_type: pickLocalizedFromRow(row, "job_type", "jobType"),
    linkedin_url: typeof row.linkedin_url === "string" ? row.linkedin_url : "",
    image_alt: pickLocalizedFromRow(row, "image_alt", "imageAlt", "alt", "alt_text"),
    image: pickLocalizedImageFromRow(row, "image", "cover"),
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
  };
}

function normalizeApplication(input: unknown): JobApplication {
  const row = (input ?? {}) as Record<string, unknown>;
  const openingRow = row.job_opening as Record<string, unknown> | null | undefined;
  return {
    id: Number(row.id ?? 0),
    job_opening_id:
      row.job_opening_id == null || row.job_opening_id === "" ? null : Number(row.job_opening_id),
    job_opening: openingRow
      ? {
          id: Number(openingRow.id ?? 0),
          title: pickLocalized(openingRow.title),
        }
      : null,
    name: typeof row.name === "string" ? row.name : "",
    email: typeof row.email === "string" ? row.email : "",
    age: row.age == null || row.age === "" ? null : Number(row.age),
    cv_file_url: typeof row.cv_file_url === "string" ? row.cv_file_url : null,
    status: typeof row.status === "string" ? row.status : "",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

export async function fetchJobsHeader(): Promise<JobsHeader> {
  const res = await api.get(`${JOBS_BASE}/header`);
  return normalizeHeader(res.data);
}

export async function saveJobsHeader(values: JobsHeaderFormValues, images: { ar: File | null; en: File | null }) {
  const fd = new FormData();
  fd.append("title[ar]", values.title.ar);
  fd.append("title[en]", values.title.en);
  fd.append("description[ar]", values.description.ar);
  fd.append("description[en]", values.description.en);
  fd.append("meta_title[ar]", values.meta_title.ar);
  fd.append("meta_title[en]", values.meta_title.en);
  fd.append("meta_description[ar]", values.meta_description.ar);
  fd.append("meta_description[en]", values.meta_description.en);
  fd.append("image_alt[ar]", values.image_alt.ar);
  fd.append("image_alt[en]", values.image_alt.en);
  fd.append("is_active", values.is_active ? "1" : "0");
  if (images.ar) fd.append("image[ar]", images.ar);
  if (images.en) fd.append("image[en]", images.en);
  const res = await api.post(`${JOBS_BASE}/header`, fd);
  return res.data;
}

export async function fetchJobsSections(): Promise<JobsSection[]> {
  const res = await api.get(`${JOBS_BASE}/sections`);
  const payload = extractPayload(res.data);
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map(normalizeSection).filter((row) => row.id > 0 || row.section_type);
}

function appendSectionFormData(fd: FormData, values: JobsSectionFormValues) {
  fd.append("section_type", values.section_type.trim());
  fd.append("name[ar]", values.name.ar.trim());
  fd.append("name[en]", values.name.en.trim());
  fd.append("sort_order", String(values.sort_order));
  fd.append("is_active", values.is_active ? "1" : "0");
  values.items.forEach((item, index) => {
    fd.append(`items[${index}][title][ar]`, item.title.ar.trim());
    fd.append(`items[${index}][title][en]`, item.title.en.trim());
    fd.append(`items[${index}][description][ar]`, item.description.ar.trim());
    fd.append(`items[${index}][description][en]`, item.description.en.trim());
    fd.append(`items[${index}][image_alt][ar]`, item.image_alt.ar.trim());
    fd.append(`items[${index}][image_alt][en]`, item.image_alt.en.trim());
    fd.append(`items[${index}][sort_order]`, String(index));
    if (item.image.ar) fd.append(`items[${index}][image][ar]`, item.image.ar);
    if (item.image.en) fd.append(`items[${index}][image][en]`, item.image.en);
  });
}

export async function upsertJobsSection(values: JobsSectionFormValues) {
  const fd = new FormData();
  appendSectionFormData(fd, values);
  const res = await api.post(`${JOBS_BASE}/sections`, fd);
  return res.data;
}

export async function updateJobsSection(id: number, values: JobsSectionFormValues) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendSectionFormData(fd, values);
  const res = await api.post(`${JOBS_BASE}/sections/${id}`, fd);
  return res.data;
}

export async function deleteJobsSection(id: number) {
  const res = await api.delete(`${JOBS_BASE}/sections/${id}`);
  return res.data;
}

function appendOpeningFormData(fd: FormData, values: JobOpeningFormValues) {
  fd.append("title[ar]", values.title.ar.trim());
  fd.append("title[en]", values.title.en.trim());
  fd.append("slug[ar]", slugifyAr(values.slug.ar));
  fd.append("slug[en]", slugify(values.slug.en));
  fd.append("description[ar]", values.description.ar.trim());
  fd.append("description[en]", values.description.en.trim());
  fd.append("job_type[ar]", values.job_type.ar.trim());
  fd.append("job_type[en]", values.job_type.en.trim());
  fd.append("linkedin_url", values.linkedin_url.trim());
  fd.append("image_alt[ar]", values.image_alt.ar.trim());
  fd.append("image_alt[en]", values.image_alt.en.trim());
  fd.append("sort_order", String(values.sort_order));
  fd.append("is_active", values.is_active ? "1" : "0");
}

export async function fetchJobOpenings(): Promise<JobOpening[]> {
  const res = await api.get(`${JOBS_BASE}/openings`);
  const payload = extractPayload(res.data);
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map(normalizeOpening).filter((row) => row.id > 0);
}

export async function createJobOpening(values: JobOpeningFormValues, images: { ar: File | null; en: File | null }) {
  const fd = new FormData();
  appendOpeningFormData(fd, values);
  if (images.ar) fd.append("image[ar]", images.ar);
  if (images.en) fd.append("image[en]", images.en);
  const res = await api.post(`${JOBS_BASE}/openings`, fd);
  return res.data;
}

export async function updateJobOpening(
  id: number,
  values: JobOpeningFormValues,
  images: { ar: File | null; en: File | null },
) {
  const fd = new FormData();
  fd.append("_method", "PUT");
  appendOpeningFormData(fd, values);
  if (images.ar) fd.append("image[ar]", images.ar);
  if (images.en) fd.append("image[en]", images.en);
  const res = await api.post(`${JOBS_BASE}/openings/${id}`, fd);
  return res.data;
}

export async function deleteJobOpening(id: number) {
  const res = await api.delete(`${JOBS_BASE}/openings/${id}`);
  return res.data;
}

export async function fetchJobApplications(params: {
  page?: number;
  perPage?: number;
  search?: string;
  jobOpeningId?: number | null;
}): Promise<JobApplicationListResult> {
  const res = await api.get(`${JOBS_BASE}/applications`, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      search: params.search ?? "",
      job_opening_id: params.jobOpeningId ?? "",
    },
  });

  const paged = unwrapLaravelPaginated<unknown>(res.data);
  if (paged) {
    return {
      rows: paged.data.map(normalizeApplication),
      meta: paged.meta,
    };
  }

  const payload = extractPayload(res.data) as Record<string, unknown> | null;
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return {
    rows: rows.map(normalizeApplication),
    meta: {
      current_page: Number(payload?.current_page ?? 1),
      from: Number(payload?.from ?? 1),
      last_page: Number(payload?.last_page ?? 1),
      path: `${JOBS_BASE}/applications`,
      per_page: Number(payload?.per_page ?? (params.perPage ?? 10)),
      to: Number(payload?.to ?? rows.length),
      total: Number(payload?.total ?? rows.length),
    },
  };
}

export async function fetchJobApplicationById(id: number): Promise<JobApplication> {
  const res = await api.get(`${JOBS_BASE}/applications/${id}`);
  return normalizeApplication(extractPayload(res.data));
}

export async function deleteJobApplication(id: number) {
  const res = await api.delete(`${JOBS_BASE}/applications/${id}`);
  return res.data;
}
