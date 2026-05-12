import { api } from "@/lib/api";
import { pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type {
  CourseDetailForForm,
  CourseFormValues,
  CourseRow,
  CourseSectionFormValues,
  CourseSectionRow,
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
  const ar = obj.ar.split(/\r?\n/).map((s) => s.trim());
  const en = obj.en.split(/\r?\n/).map((s) => s.trim());
  const n = Math.max(ar.length, en.length);
  const arr: { title: { ar: string; en: string } }[] = [];
  for (let i = 0; i < n; i++) {
    const a = ar[i] ?? "";
    const e = en[i] ?? "";
    if (!a.trim() && !e.trim()) continue;
    arr.push({ title: { ar: a, en: e } });
  }
  return JSON.stringify(arr);
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
  const slug = stringField(r, ["slug", "url_slug"]);
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
  try {
    const res = await api.get(`/v1/courses/${encodeURIComponent(slug)}`);
    const raw = unwrapEntity(res.data ?? res);
    return raw;
  } catch {
    return null;
  }
}

async function findListCourseRecord(id: string): Promise<Record<string, unknown> | null> {
  try {
    const listRes = await api.get(`/v1/courses`);
    const body = (listRes.data as { data?: unknown })?.data ?? listRes.data;
    const rows = unwrapDataArray(body);
    let raw = rows.find((rec) => readId(rec) === id);
    if (!raw) return null;

    let r = raw as Record<string, unknown>;
    const slug = stringField(r, ["slug", "url_slug"]);
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
    raw.objectives ?? raw.learning_objectives ?? raw.goals ?? raw.learningGoals;
  return {
    values: {
      title: {
        ar: pickLocalized(raw.title, "ar"),
        en: pickLocalized(raw.title, "en"),
      },
      description: desc,
      price: raw.price != null ? String(raw.price) : "",
      compare_price: readComparePriceFromRecord(raw),
      currency: stringField(raw, ["currency"]),
      objectives: objectivesFormFromApi(objectivesRaw),
    },
    coverUrl: coverFromRecord(raw),
  };
}

export async function fetchCourseDetailForEdit(id: string): Promise<CourseDetailForForm | null> {
  try {
    const res = await api.get(`/v1/admin/courses/${id}`);
    const raw = unwrapEntity(res.data ?? res);
    if (raw && readId(raw)) return recordToCourseFormValues(raw);
  } catch {
    /* fallback */
  }

  const raw = await findListCourseRecord(id);
  if (!raw || !readId(raw)) return null;
  return recordToCourseFormValues(raw);
}

export function courseValuesToFormData(values: CourseFormValues, imageFile: File | null): FormData {
  const fd = new FormData();
  fd.append("title[ar]", values.title.ar);
  fd.append("title[en]", values.title.en);
  fd.append("description", JSON.stringify(values.description));
  if (values.price.trim()) fd.append("price", values.price.trim());
  if (values.compare_price.trim()) fd.append("compare_at_price", values.compare_price.trim());
  if (values.currency.trim()) fd.append("currency", values.currency.trim());

  const objJson = objectivesPayloadFromForm(values.objectives);
  if (objJson !== "[]") {
    fd.append("objectives", objJson);
    fd.append("learning_objectives", objJson);
  }

  if (imageFile instanceof File) {
    fd.append("image", imageFile);
  }
  return fd;
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
  const res = await api.post(`/v1/admin/courses/${courseId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
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
  const dur = r.duration;
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
  return unwrapDataArray(body)
    .map(normalizeSection)
    .filter((x): x is CourseSectionRow => x != null)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function createCourseSection(courseIdNum: number, values: CourseSectionFormValues) {
  const body: Record<string, unknown> = {
    course_id: courseIdNum,
    title: values.title,
    video_url: values.video_url.trim(),
    is_free: values.is_free ? 1 : 0,
    sort_order: values.sort_order,
  };
  const d = values.duration.trim();
  if (d) body.duration = d;

  const res = await api.post("/v1/admin/course-sections", body);
  return res.data;
}

export async function updateCourseSection(sectionId: string, courseIdNum: number, values: CourseSectionFormValues) {
  const body: Record<string, unknown> = {
    course_id: courseIdNum,
    title: values.title,
    video_url: values.video_url.trim(),
    is_free: values.is_free ? 1 : 0,
    sort_order: values.sort_order,
  };
  const d = values.duration.trim();
  if (d) body.duration = d;

  const res = await api.put(`/v1/admin/course-sections/${sectionId}`, body);
  return res.data;
}

export async function deleteCourseSection(sectionId: string) {
  const res = await api.delete(`/v1/admin/course-sections/${sectionId}`);
  return res.data;
}
