import { api } from "@/lib/api";
import {
  pickBilingualSlug,
  pickLocalized,
  readId,
  unwrapDataArray,
} from "@/lib/api-payload";
import type {
  SolutionCategoryFormValues,
  SolutionCategoryListParams,
  SolutionCategoryPage,
  SolutionCategoryRow,
} from "../types";

const PUBLIC_CATEGORIES = "/v1/categories";
const ADMIN_CATEGORIES = "/v1/admin/categories";
const TYPE_SOLUTIONS = "solutions";

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

function assertApiEnvelopeSuccess(data: unknown): void {
  if (data == null || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const s = d.status;
  if (s === false || s === "false" || s === 0 || s === "0") {
    const msg =
      typeof d.message === "string" && d.message.trim() ? d.message.trim() : "Request failed";
    throw new Error(msg);
  }
}

function pickListMeta(payload: unknown): SolutionCategoryPage["meta"] {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta);
  return {
    currentPage: toFiniteNumber(meta?.current_page, 1),
    lastPage: toFiniteNumber(meta?.last_page, 1),
    perPage: toFiniteNumber(meta?.per_page, 10),
    total: toFiniteNumber(meta?.total),
  };
}

function normalizeTaxonomyRow(raw: unknown): SolutionCategoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = readId(r);
  if (!id) return null;
  const slug = pickBilingualSlug(r.slug);
  const singlesCount = toFiniteNumber(
    r.solution_singles_count ?? r.solutions_count ?? r.singles_count,
    0,
  );
  return {
    id,
    nameAr: pickLocalized(r.name, "ar"),
    nameEn: pickLocalized(r.name, "en"),
    slugAr: slug.ar,
    slugEn: slug.en,
    singlesCount,
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
  };
}

function normalizeListBody(body: unknown): SolutionCategoryRow[] {
  return unwrapDataArray(body)
    .map((row) => normalizeTaxonomyRow(row))
    .filter((x): x is SolutionCategoryRow => x != null);
}

/**
 * Paginated list: GET /v1/categories?type=solutions
 */
export async function fetchSolutionCategoriesPage(
  params: SolutionCategoryListParams = {},
): Promise<SolutionCategoryPage> {
  const res = await api.get<unknown>(PUBLIC_CATEGORIES, {
    params: {
      type: TYPE_SOLUTIONS,
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

/** All pages for selects (e.g. solution single form). */
export async function fetchAllSolutionCategories(): Promise<SolutionCategoryRow[]> {
  const first = await fetchSolutionCategoriesPage({ page: 1, perPage: 100 });
  if (first.meta.lastPage <= 1) return first.rows;
  const rest = await Promise.all(
    Array.from({ length: first.meta.lastPage - 1 }, (_, i) =>
      fetchSolutionCategoriesPage({ page: i + 2, perPage: first.meta.perPage || 100 }),
    ),
  );
  return rest.reduce<SolutionCategoryRow[]>((acc, p) => acc.concat(p.rows), first.rows);
}

export function valuesToUpsertFormData(values: SolutionCategoryFormValues, categoryId?: string | null) {
  const fd = new FormData();
  fd.append("type", TYPE_SOLUTIONS);
  if (categoryId?.trim()) {
    fd.append("id", categoryId.trim());
  }
  fd.append("name[ar]", values.name.ar.trim());
  fd.append("name[en]", values.name.en.trim());
  fd.append("slug[ar]", (values.slug.ar ?? "").trim());
  fd.append("slug[en]", (values.slug.en ?? "").trim());
  fd.append("description[ar]", values.description.ar ?? "");
  fd.append("description[en]", values.description.en ?? "");
  fd.append("meta_title[ar]", values.meta_title.ar ?? "");
  fd.append("meta_title[en]", values.meta_title.en ?? "");
  fd.append("meta_description[ar]", values.meta_description.ar ?? "");
  fd.append("meta_description[en]", values.meta_description.en ?? "");
  return fd;
}

export async function upsertSolutionCategory(values: SolutionCategoryFormValues, categoryId?: string | null) {
  const fd = valuesToUpsertFormData(values, categoryId);
  const res = await api.post(ADMIN_CATEGORIES, fd);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export function rowToFormValues(row: SolutionCategoryRow): SolutionCategoryFormValues {
  return {
    name: { ar: row.nameAr, en: row.nameEn },
    slug: { ar: row.slugAr, en: row.slugEn },
    description: { ar: "", en: "" },
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
  };
}
