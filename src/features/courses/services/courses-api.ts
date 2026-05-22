/**
 * Admin courses & course-sections — aligned with the live Laravel API:
 * - Course create: `POST /v1/admin/courses` multipart (`title[ar|en]`, `slug[ar|en]`, `price`, `is_active`, …).
 * - Course update: `PUT /v1/admin/courses/{id}` JSON (`slug: { ar, en }`) when no new cover; multipart + `_method=PUT` when uploading image (Laravel).
 * - Section create: `POST /v1/admin/course-sections` multipart (`course_id`, `title[ar|en]`, `sort_order`, …).
 * - Section update: `PUT /v1/admin/course-sections/{id}` JSON (`title`, `sort_order`, …).
 *
 * NOTE: The shipped Postman collection still shows `slug` as a single string, but
 * the current server rejects that with `حقل slug يجب أن يكون مصفوفة` and requires
 * `slug[ar]` / `slug[en]` (matching blog-categories).
 */
import { api } from "@/lib/api";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import { appendBilingualImageAlt, bilingualImageAltFromApi } from "@/lib/bilingual-image-alt";
import { pickBilingualSlug, pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type {
  CourseDetailForForm,
  CourseFormValues,
  CourseRow,
  CourseSectionFormValues,
  CourseSectionRow,
  LocalizedString,
} from "../types";

function unwrapEntity(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const top = payload as Record<string, unknown>;
  const d = top.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  return top;
}

export function extractCreatedIdFromCourseResponse(res: unknown): string | null {
  const top = unwrapEntity(res);
  if (!top) return null;
  const direct = top.id;
  if (direct != null) return String(direct);
  const course = top.course;
  if (course && typeof course === "object" && !Array.isArray(course)) {
    const cid = (course as Record<string, unknown>).id;
    if (cid != null) return String(cid);
  }
  return null;
}

function objectivesFormFromApi(raw: unknown): { ar: string; en: string } {
  const empty = { ar: "", en: "" };
  if (raw == null) return empty;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return empty;
    try {
      return objectivesFormFromApi(JSON.parse(t) as unknown);
    } catch {
      return empty;
    }
  }
  if (!Array.isArray(raw)) return empty;
  const arLines: string[] = [];
  const enLines: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      arLines.push(item.trim());
      enLines.push(item.trim());
      continue;
    }
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      const nested = o.title ?? o.text;
      if (typeof nested === "string" && nested.trim()) {
        arLines.push(nested.trim());
        enLines.push(nested.trim());
      } else if (nested && typeof nested === "object") {
        const a = pickLocalized(nested, "ar").trim();
        const e = pickLocalized(nested, "en").trim();
        if (a || e) {
          arLines.push(a);
          enLines.push(e);
        }
      }
    }
  }
  return {
    ar: arLines.filter(Boolean).join("\n"),
    en: enLines.filter(Boolean).join("\n"),
  };
}

/** JSON array `{ title: { ar, en } }[]` for course create/update multipart field `objectives`. */
function objectivesPayloadFromForm(obj: { ar: string; en: string }): string {
  const ar = localizedHtmlForApi(obj.ar);
  const en = localizedHtmlForApi(obj.en);
  const arr = ar || en ? [{ title: { ar, en } }] : [];
  return JSON.stringify(arr);
}

function descriptionPayloadFromForm(desc: { ar: string; en: string }): string {
  return JSON.stringify({
    ar: localizedHtmlForApi(desc.ar),
    en: localizedHtmlForApi(desc.en),
  });
}

function readComparePriceFromRecord(r: Record<string, unknown>): string {
  const keys = ["compare_at_price", "old_price", "list_price", "compare_price"];
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function parseDescriptionFromApi(raw: unknown): { ar: string; en: string } {
  if (raw == null) return { ar: "", en: "" };
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return {
      ar: pickLocalized(raw, "ar"),
      en: pickLocalized(raw, "en"),
    };
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return { ar: "", en: "" };
    try {
      const o = JSON.parse(t) as unknown;
      return parseDescriptionFromApi(o);
    } catch {
      return { ar: raw, en: raw };
    }
  }
  return { ar: "", en: "" };
}

function stringField(r: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}

function readIsActive(r: Record<string, unknown>): boolean {
  const v = r.is_active ?? r.isActive;
  if (v === false || v === 0 || v === "0") return false;
  if (v === true || v === 1 || v === "1") return true;
  return true;
}

/** ASCII slug from English title when the user leaves the English slug empty. */
export function slugifyCourseSlugFromEn(titleEn: string): string {
  const t = titleEn.trim().toLowerCase();
  if (!t) return "course";
  const s = t
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "course";
}

/** Arabic slug fallback from the Arabic title — keeps Arabic letters + digits. */
function slugifyCourseSlugFromAr(titleAr: string): string {
  const t = titleAr.trim().toLowerCase();
  if (!t) return "course";
  const s = t
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "course";
}

/**
 * Resolves the localized slug, generating sensible fallbacks per locale when
 * either field is left empty so the API never receives an empty `slug[ar]` / `slug[en]`.
 */
function resolvedCourseSlug(values: CourseFormValues): LocalizedString {
  const ar = values.slug.ar.trim();
  const en = values.slug.en.trim();
  return {
    ar: ar || slugifyCourseSlugFromAr(values.title.ar) || slugifyCourseSlugFromEn(values.title.en),
    en: en || slugifyCourseSlugFromEn(values.title.en),
  };
}

export function assetUrlFromApiPath(path: string): string {
  const t = path.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  const env = import.meta.env.VITE_API_URL as string | undefined;
  const base = (env ?? "").replace(/\/$/, "");
  const origin = base.replace(/\/?api$/i, "");
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

function coverFromRecord(r: Record<string, unknown>): string | null {
  const raw =
    r.image ??
    r.cover_image ??
    r.cover ??
    r.thumbnail ??
    r.media_url ??
    (typeof r.image_url === "string" ? r.image_url : null);

  if (typeof raw === "string" && raw.trim()) return assetUrlFromApiPath(raw);
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const url = o.url ?? o.path ?? o.original_url;
    if (typeof url === "string" && url.trim()) return assetUrlFromApiPath(url);
  }
  return null;
}

function normalizeCourseRecord(raw: unknown): CourseRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  // Server now serialises slug as `{ ar, en }`. Fall back to legacy single-string
  // `slug` / `url_slug` values so the table keeps rendering during rollouts.
  const bilingual = pickBilingualSlug(r.slug ?? r.url_slug);
  const slug = bilingual.en || bilingual.ar || stringField(r, ["slug", "url_slug"]);
  const priceRaw = r.price ?? r.amount;
  let priceLabel =
    priceRaw != null && String(priceRaw).trim() !== ""
      ? String(priceRaw)
      : "—";
  const curRaw = typeof r.currency === "string" ? r.currency.trim() : "";
  if (curRaw && priceLabel !== "—") priceLabel = `${curRaw}${priceLabel}`;

  return {
    id,
    titleAr: pickLocalized(r.title, "ar"),
    titleEn: pickLocalized(r.title, "en"),
    slug,
    priceLabel,
  };
}

export function normalizeCourseListPayload(payload: unknown): CourseRow[] {
  return unwrapDataArray(payload)
    .map((row) => normalizeCourseRecord(row))
    .filter((x): x is CourseRow => x != null);
}

export async function fetchCourses(_locale: "ar" | "en"): Promise<CourseRow[]> {
  const urls = ["/v1/courses", "/v1/admin/courses"];
  let lastErr: unknown;
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url);
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return normalizeCourseListPayload(body);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function fetchRawCourseDetail(slug: string): Promise<Record<string, unknown> | null> {
  const urls = [`/v1/courses/${encodeURIComponent(slug)}`, `/v1/admin/courses/${encodeURIComponent(slug)}`];
  for (const url of urls) {
    try {
      const res = await api.get(url);
      const raw = unwrapEntity(res.data ?? res);
      if (raw && readId(raw)) return raw;
    } catch {
      /* ignore and try next */
    }
  }
  return null;
}

async function findListCourseRecord(id: string): Promise<Record<string, unknown> | null> {
  try {
    const listRes = await api.get(`/v1/courses`);
    const body = (listRes.data as { data?: unknown })?.data ?? listRes.data;
    const rows = unwrapDataArray(body);
    let raw = rows.find((rec) => readId(rec) === id);
    if (!raw) return null;

    let r = raw as Record<string, unknown>;
    const bilingualSlug = pickBilingualSlug(r.slug ?? r.url_slug);
    const slug = bilingualSlug.en || bilingualSlug.ar || stringField(r, ["slug", "url_slug"]);
    if (slug) {
      const detail = await fetchRawCourseDetail(slug);
      if (detail && readId(detail)) r = detail;
    }
    return r;
  } catch {
    return null;
  }
}

export function recordToCourseFormValues(raw: Record<string, unknown>): CourseDetailForForm {
  const desc = parseDescriptionFromApi(raw.description);
  const objectivesRaw =
    raw.objectives ?? raw.learning_objectives ?? raw.goals ?? raw.learningGoals ?? raw.features;
  return {
    values: {
      title: {
        ar: pickLocalized(raw.title, "ar"),
        en: pickLocalized(raw.title, "en"),
      },
      description: desc,
      slug: pickBilingualSlug(raw.slug ?? raw.url_slug),
      is_active: readIsActive(raw),
      price: raw.price != null ? String(raw.price) : "",
      compare_price: readComparePriceFromRecord(raw),
      currency: stringField(raw, ["currency"]),
      objectives: objectivesFormFromApi(objectivesRaw),
      image_alt: bilingualImageAltFromApi(raw.image_alt),
    },
    coverUrl: coverFromRecord(raw),
  };
}

function localizedTextFromRecord(
  raw: Record<string, unknown> | null,
  key: string,
  locale: "ar" | "en",
): string {
  if (!raw) return "";
  const value = raw[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      return localizedTextFromRecord({ value: JSON.parse(trimmed) as unknown }, "value", locale);
    } catch {
      return trimmed;
    }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return pickLocalized(value, locale).trim();
  }
  return "";
}

function localizedSlugFromRecord(raw: Record<string, unknown> | null, locale: "ar" | "en"): string {
  if (!raw) return "";
  const value = raw.slug ?? raw.url_slug;
  if (typeof value === "string") return value.trim();
  return pickBilingualSlug(value)[locale];
}

function mergeLocalizedCourseRecords(
  base: Record<string, unknown>,
  arRaw: Record<string, unknown> | null,
  enRaw: Record<string, unknown> | null,
): Record<string, unknown> {
  const title = {
    ar: localizedTextFromRecord(arRaw, "title", "ar") || localizedTextFromRecord(base, "title", "ar"),
    en: localizedTextFromRecord(enRaw, "title", "en") || localizedTextFromRecord(base, "title", "en"),
  };
  const description = {
    ar:
      localizedTextFromRecord(arRaw, "description", "ar") ||
      localizedTextFromRecord(base, "description", "ar"),
    en:
      localizedTextFromRecord(enRaw, "description", "en") ||
      localizedTextFromRecord(base, "description", "en"),
  };
  const slug = {
    ar: localizedSlugFromRecord(arRaw, "ar") || localizedSlugFromRecord(base, "ar"),
    en: localizedSlugFromRecord(enRaw, "en") || localizedSlugFromRecord(base, "en"),
  };

  return {
    ...base,
    title,
    description,
    slug,
  };
}

async function fetchCourseRecordForLocale(
  id: string,
  locale: "ar" | "en",
): Promise<Record<string, unknown> | null> {
  const urls = [`/v1/admin/courses/${id}`, `/v1/courses/${id}`];
  for (const url of urls) {
    try {
      const res = await api.get(url, {
        headers: { "Accept-Language": locale },
      });
      const raw = unwrapEntity(res.data ?? res);
      if (raw && readId(raw)) return raw;
    } catch {
      /* ignore and try next */
    }
  }
  return null;
}

export async function fetchCourseDetailForEdit(id: string): Promise<CourseDetailForForm | null> {
  const [arRaw, enRaw] = await Promise.all([
    fetchCourseRecordForLocale(id, "ar"),
    fetchCourseRecordForLocale(id, "en"),
  ]);

  const base = arRaw ?? enRaw;
  if (base && readId(base)) {
    return recordToCourseFormValues(mergeLocalizedCourseRecords(base, arRaw, enRaw));
  }

  const raw = await findListCourseRecord(id);
  if (!raw || !readId(raw)) return null;
  return recordToCourseFormValues(raw);
}

export function courseValuesToFormData(values: CourseFormValues, imageFile: File | null): FormData {
  const fd = new FormData();
  const slug = resolvedCourseSlug(values);
  fd.append("title[ar]", values.title.ar);
  fd.append("title[en]", values.title.en);
  fd.append("slug[ar]", slug.ar);
  fd.append("slug[en]", slug.en);
  fd.append("is_active", values.is_active ? "1" : "0");
  fd.append("description", descriptionPayloadFromForm(values.description));
  if (values.price.trim()) fd.append("price", values.price.trim());
  if (values.compare_price.trim()) fd.append("compare_at_price", values.compare_price.trim());
  if (values.currency.trim()) fd.append("currency", values.currency.trim());

  const objJson = objectivesPayloadFromForm(values.objectives);
  if (objJson !== "[]") {
    fd.append("objectives", objJson);
    fd.append("learning_objectives", objJson);
    fd.append("features", objJson);
  }

  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  }
  appendBilingualImageAlt(fd, "image_alt", values.image_alt);
  return fd;
}

function courseUpdateJsonBody(values: CourseFormValues): Record<string, unknown> {
  const slug = resolvedCourseSlug(values);
  const body: Record<string, unknown> = {
    title: values.title,
    slug,
    is_active: values.is_active ? 1 : 0,
    description: {
      ar: localizedHtmlForApi(values.description.ar),
      en: localizedHtmlForApi(values.description.en),
    },
  };
  if (values.price.trim()) body.price = values.price.trim();
  if (values.compare_price.trim()) body.compare_at_price = values.compare_price.trim();
  if (values.currency.trim()) body.currency = values.currency.trim();
  body.image_alt = values.image_alt;

  const objJson = objectivesPayloadFromForm(values.objectives);
  if (objJson !== "[]") {
    try {
      const parsed = JSON.parse(objJson) as unknown;
      body.objectives = parsed;
      body.learning_objectives = parsed;
      body.features = parsed;
    } catch {
      /* ignore malformed objectives */
    }
  }
  return body;
}

export async function createCourse(values: CourseFormValues, imageFile: File | null) {
  const fd = courseValuesToFormData(values, imageFile);
  const res = await api.post("/v1/admin/courses", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateCourse(courseId: string, values: CourseFormValues, imageFile: File | null) {
  const fd = courseValuesToFormData(values, imageFile);
  fd.append("_method", "PUT");
  try {
    const res = await api.post(`/v1/admin/courses/${courseId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.warn("[updateCourse] admin route failed, trying public route", err);
    const res = await api.post(`/v1/courses/${courseId}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
}

export async function deleteCourse(courseId: string) {
  const res = await api.delete(`/v1/admin/courses/${courseId}`);
  return res.data;
}

/** --- Sections (lessons under a course) --- */

export function normalizeSection(raw: unknown): CourseSectionRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  const free = r.is_free ?? r.isFree ?? r.preview;
  const dur =
    r.duration ??
    r.duration_label ??
    r.durationLabel ??
    r.time ??
    r.time_label ??
    r.timeLabel ??
    r.minutes ??
    r.duration_minutes;
  const durationStr =
    typeof dur === "string"
      ? dur
      : dur != null && String(dur).trim() !== ""
        ? String(dur)
        : "";
  return {
    id,
    titleAr: pickLocalized(r.title, "ar"),
    titleEn: pickLocalized(r.title, "en"),
    video_url: typeof r.video_url === "string" ? r.video_url : typeof r.videoUrl === "string" ? r.videoUrl : "",
    duration: durationStr,
    is_free: free === true || free === 1 || free === "1",
    sort_order: typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order ?? 0) || 0,
  };
}

export async function fetchCourseSections(courseId: string): Promise<CourseSectionRow[]> {
  const res = await api.get(`/v1/courses/${courseId}/sections`);
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const rawRows = unwrapDataArray(body);
  const normalizedRows = rawRows
    .map(normalizeSection)
    .filter((x): x is CourseSectionRow => x != null)
    .sort((a, b) => a.sort_order - b.sort_order);
  console.table(
    rawRows.map((row) => ({
      id: row.id,
      title: row.title,
      duration: row.duration,
      duration_label: row.duration_label,
      time: row.time,
      minutes: row.minutes,
      duration_minutes: row.duration_minutes,
      normalized_duration: normalizedRows.find((normalized) => normalized.id === String(row.id))?.duration ?? "",
    })),
  );
  console.log("[CoursesSections] backend sections response:", {
    courseId,
    response: res.data,
    body,
    rawRows,
    normalizedRows,
  });
  return normalizedRows;
}

function courseSectionFormData(courseIdNum: number, values: CourseSectionFormValues): FormData {
  const fd = new FormData();
  fd.append("course_id", String(courseIdNum));
  fd.append("title[ar]", values.title.ar);
  fd.append("title[en]", values.title.en);
  fd.append("sort_order", String(values.sort_order));
  const v = values.video_url.trim();
  if (v) fd.append("video_url", v);
  const d = values.duration.trim();
  if (d) fd.append("duration", d);
  fd.append("is_free", values.is_free ? "1" : "0");
  return fd;
}

export async function createCourseSection(courseIdNum: number, values: CourseSectionFormValues) {
  const fd = courseSectionFormData(courseIdNum, values);
  const res = await api.post("/v1/admin/course-sections", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateCourseSection(sectionId: string, _courseIdNum: number, values: CourseSectionFormValues) {
  const body: Record<string, unknown> = {
    title: values.title,
    sort_order: values.sort_order,
  };
  const v = values.video_url.trim();
  if (v) body.video_url = v;
  const d = values.duration.trim();
  if (d) body.duration = d;
  body.is_free = values.is_free ? 1 : 0;

  const res = await api.put(`/v1/admin/course-sections/${sectionId}`, body);
  return res.data;
}

export async function deleteCourseSection(sectionId: string) {
  const res = await api.delete(`/v1/admin/course-sections/${sectionId}`);
  return res.data;
}
