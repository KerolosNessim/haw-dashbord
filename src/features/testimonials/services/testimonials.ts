import { api } from "@/lib/api";
import { countryIdsQuery } from "@/features/home-content/lib/country-scope";
import type {
  LocaleString,
  TestimonialItemData,
  TestimonialsGeneralData,
  TestimonialsListData,
  TestimonialsResponse,
} from "../types";

function localeString(raw: unknown): LocaleString {
  if (raw == null) return { ar: "", en: "" };
  if (typeof raw === "string") return { ar: raw, en: raw };
  if (typeof raw !== "object" || Array.isArray(raw)) return { ar: "", en: "" };
  const row = raw as { ar?: unknown; en?: unknown };
  return {
    ar: row.ar != null ? String(row.ar) : "",
    en: row.en != null ? String(row.en) : "",
  };
}

function pickImageUrl(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const row = raw as Record<string, unknown>;
    if (typeof row.url === "string" && row.url.trim()) return row.url.trim();
    if (typeof row.path === "string" && row.path.trim()) return row.path.trim();
  }
  return null;
}

function normalizeTestimonialItem(raw: unknown): TestimonialItemData | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const contentBlock =
    row.content && typeof row.content === "object" && !Array.isArray(row.content)
      ? (row.content as Record<string, unknown>)
      : null;
  const media =
    row.media && typeof row.media === "object" && !Array.isArray(row.media)
      ? (row.media as Record<string, unknown>)
      : null;

  const name = localeString(contentBlock?.name ?? row.name);
  const job_title = localeString(contentBlock?.job_title ?? row.job_title);
  const testimonialContent = localeString(
    contentBlock?.content ?? row.description ?? row.content,
  );

  const image =
    pickImageUrl(media?.image) ??
    pickImageUrl(row.image) ??
    pickImageUrl(row.image_url);

  const country_ids = Array.isArray(row.country_ids)
    ? row.country_ids.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0)
    : [];

  return {
    id,
    content: { name, job_title, content: testimonialContent },
    name,
    job_title,
    description: testimonialContent,
    image,
    rate: Number(row.rate ?? row.rating ?? 5) || 5,
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active !== false && row.is_active !== 0 && row.is_active !== "0",
    country_ids,
  };
}

/** Admin list: `data` may be a flat array or `{ testimonials: [...] }`. */
export function normalizeTestimonialsListPayload(body: unknown): TestimonialsListData {
  const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const data = root.data ?? body;

  let rows: unknown[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.testimonials)) rows = rec.testimonials;
  }

  const testimonials = rows
    .map(normalizeTestimonialItem)
    .filter((item): item is TestimonialItemData => item != null)
    .sort((a, b) => a.sort_order - b.sort_order);

  return { testimonials };
}

export const getTestimonialsGeneral = (
  countryIds?: number[],
): Promise<TestimonialsResponse<TestimonialsGeneralData>> => {
  return api
    .get<TestimonialsResponse<TestimonialsGeneralData>>("/v1/admin/testimonials/content", {
      params: countryIdsQuery(countryIds),
    })
    .then((res) => res.data);
};

export const updateTestimonialsGeneral = (
  data: FormData,
): Promise<TestimonialsResponse<TestimonialsGeneralData>> => {
  return api
    .post<TestimonialsResponse<TestimonialsGeneralData>>("/v1/admin/testimonials/content", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getTestimonialsList = async (countryIds?: number[]): Promise<TestimonialsListData> => {
  const res = await api.get<TestimonialsResponse<unknown>>("/v1/admin/testimonials", {
    params: countryIdsQuery(countryIds),
  });
  return normalizeTestimonialsListPayload(res.data);
};

export const updateTestimonialsList = (
  data: FormData,
): Promise<TestimonialsResponse<TestimonialsListData>> => {
  return api
    .post<TestimonialsResponse<TestimonialsListData>>("/v1/admin/testimonials/bulk-sync", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
