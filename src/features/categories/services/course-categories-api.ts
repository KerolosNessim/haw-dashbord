import { api } from "@/lib/api";
import { pickBilingualSlug, pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import type { CourseCategoryListParams, CourseCategoryPage, CourseCategoryRow } from "../types";

const PUBLIC_CATEGORIES = "/v1/categories";
const TYPE_COURSES = "courses";

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

function pickListMeta(payload: unknown): CourseCategoryPage["meta"] {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta);
  return {
    currentPage: toFiniteNumber(meta?.current_page, 1),
    lastPage: toFiniteNumber(meta?.last_page, 1),
    perPage: toFiniteNumber(meta?.per_page, 15),
    total: toFiniteNumber(meta?.total),
  };
}

function readIsActive(r: Record<string, unknown>): boolean {
  const raw = r.is_active ?? r.isActive ?? r.status;
  if (raw === false || raw === 0 || raw === "0" || raw === "inactive") return false;
  return true;
}

function normalizeCategoryRow(raw: unknown): CourseCategoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;

  const slug = pickBilingualSlug(r.slug);
  return {
    id,
    nameAr: pickLocalized(r.name ?? r.title, "ar"),
    nameEn: pickLocalized(r.name ?? r.title, "en"),
    slugAr: slug.ar,
    slugEn: slug.en,
    coursesCount: toFiniteNumber(
      r.courses_count ?? r.course_count ?? r.items_count ?? r.singles_count,
      0,
    ),
    isActive: readIsActive(r),
  };
}

function normalizeListBody(body: unknown): CourseCategoryRow[] {
  return unwrapDataArray(body)
    .map((row) => normalizeCategoryRow(row))
    .filter((x): x is CourseCategoryRow => x != null);
}

export async function fetchCourseCategoriesPage(
  params: CourseCategoryListParams = {},
): Promise<CourseCategoryPage> {
  const res = await api.get<unknown>(PUBLIC_CATEGORIES, {
    params: {
      type: TYPE_COURSES,
      page: params.page && params.page > 0 ? params.page : 1,
      per_page: params.perPage && params.perPage > 0 ? params.perPage : 15,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  });
  const envelope = res.data;
  const root = asRecord(envelope);
  const inner = root?.data ?? envelope;
  return {
    rows: normalizeListBody(inner),
    meta: pickListMeta(envelope),
  };
}
