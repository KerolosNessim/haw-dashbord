import { api } from "@/lib/api";
import { appendLocalizedDescriptionHtml } from "@/lib/localized-html-form";
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

/** Dedicated solutions module (Postman). */
const PUBLIC_SOLUTION_CATEGORIES = "/v1/solutions/categories";
const ADMIN_SOLUTION_CATEGORIES = "/v1/admin/solutions/categories";

/** Legacy taxonomy fallback. */
const PUBLIC_TAXONOMY_CATEGORIES = "/v1/categories";
const ADMIN_TAXONOMY_CATEGORIES = "/v1/admin/categories";
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

function pickCategoryName(r: Record<string, unknown>, locale: "ar" | "en"): string {
  return pickLocalized(r.title, locale) || pickLocalized(r.name, locale);
}

function normalizeCategoryRow(raw: unknown): SolutionCategoryRow | null {
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
    nameAr: pickCategoryName(r, "ar"),
    nameEn: pickCategoryName(r, "en"),
    slugAr: slug.ar,
    slugEn: slug.en,
    singlesCount,
    isActive: Boolean(r.is_active ?? r.isActive ?? true),
  };
}

function normalizeListBody(body: unknown): SolutionCategoryRow[] {
  return unwrapDataArray(body)
    .map((row) => normalizeCategoryRow(row))
    .filter((x): x is SolutionCategoryRow => x != null);
}

function listQueryParams(params: SolutionCategoryListParams): Record<string, string | number> {
  return {
    page: params.page && params.page > 0 ? params.page : 1,
    per_page: params.perPage && params.perPage > 0 ? params.perPage : 15,
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
  };
}

async function fetchSolutionCategoriesPageDedicated(
  params: SolutionCategoryListParams,
): Promise<SolutionCategoryPage> {
  const res = await api.get<unknown>(ADMIN_SOLUTION_CATEGORIES, {
    params: listQueryParams(params),
  });
  const envelope = res.data;
  const root = asRecord(envelope);
  const inner = root?.data ?? envelope;
  return {
    rows: normalizeListBody(inner),
    meta: pickListMeta(envelope),
  };
}

async function fetchSolutionCategoriesPageTaxonomy(
  params: SolutionCategoryListParams,
): Promise<SolutionCategoryPage> {
  const res = await api.get<unknown>(PUBLIC_TAXONOMY_CATEGORIES, {
    params: {
      type: TYPE_SOLUTIONS,
      ...listQueryParams(params),
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

/**
 * Paginated admin list — prefers `GET /v1/admin/solutions/categories`.
 */
export async function fetchSolutionCategoriesPage(
  params: SolutionCategoryListParams = {},
): Promise<SolutionCategoryPage> {
  try {
    return await fetchSolutionCategoriesPageDedicated(params);
  } catch {
    return fetchSolutionCategoriesPageTaxonomy(params);
  }
}

async function fetchAllDedicated(): Promise<SolutionCategoryRow[]> {
  const first = await fetchSolutionCategoriesPageDedicated({ page: 1, perPage: 100 });
  if (first.meta.lastPage <= 1) return first.rows;
  const rest = await Promise.all(
    Array.from({ length: first.meta.lastPage - 1 }, (_, i) =>
      fetchSolutionCategoriesPageDedicated({ page: i + 2, perPage: first.meta.perPage || 100 }),
    ),
  );
  return rest.reduce<SolutionCategoryRow[]>((acc, p) => acc.concat(p.rows), first.rows);
}

async function fetchAllTaxonomy(): Promise<SolutionCategoryRow[]> {
  const res = await api.get<unknown>(PUBLIC_TAXONOMY_CATEGORIES, {
    params: { type: TYPE_SOLUTIONS, per_page: 100, page: 1 },
  });
  const root = asRecord(res.data);
  const inner = root?.data ?? res.data;
  return normalizeListBody(inner);
}

/** All categories for selects (solution single form). */
export async function fetchAllSolutionCategories(): Promise<SolutionCategoryRow[]> {
  try {
    return await fetchAllDedicated();
  } catch {
    try {
      const first = await fetchSolutionCategoriesPageTaxonomy({ page: 1, perPage: 100 });
      if (first.meta.lastPage <= 1) return first.rows;
      const rest = await Promise.all(
        Array.from({ length: first.meta.lastPage - 1 }, (_, i) =>
          fetchSolutionCategoriesPageTaxonomy({
            page: i + 2,
            perPage: first.meta.perPage || 100,
          }),
        ),
      );
      return rest.reduce<SolutionCategoryRow[]>((acc, p) => acc.concat(p.rows), first.rows);
    } catch {
      return fetchAllTaxonomy();
    }
  }
}

/** Public list for reference (same normalizer as admin). */
export async function fetchPublicSolutionCategoriesList(): Promise<SolutionCategoryRow[]> {
  try {
    const res = await api.get<unknown>(PUBLIC_SOLUTION_CATEGORIES, {
      params: { per_page: 100, page: 1 },
    });
    const root = asRecord(res.data);
    return normalizeListBody(root?.data ?? res.data);
  } catch {
    return fetchAllTaxonomy();
  }
}

function valuesToDedicatedJson(values: SolutionCategoryFormValues) {
  return {
    title: { ar: values.name.ar.trim(), en: values.name.en.trim() },
    slug: { ar: (values.slug.ar ?? "").trim(), en: (values.slug.en ?? "").trim() },
    is_active: true,
    meta_title: { ar: values.meta_title.ar ?? "", en: values.meta_title.en ?? "" },
    meta_description: {
      ar: values.meta_description.ar ?? "",
      en: values.meta_description.en ?? "",
    },
  };
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
  appendLocalizedDescriptionHtml(fd, "description", values.description.ar, values.description.en);
  fd.append("meta_title[ar]", values.meta_title.ar ?? "");
  fd.append("meta_title[en]", values.meta_title.en ?? "");
  fd.append("meta_description[ar]", values.meta_description.ar ?? "");
  fd.append("meta_description[en]", values.meta_description.en ?? "");
  return fd;
}

export async function upsertSolutionCategory(
  values: SolutionCategoryFormValues,
  categoryId?: string | null,
) {
  const body = valuesToDedicatedJson(values);
  try {
    if (categoryId?.trim()) {
      const res = await api.put(`${ADMIN_SOLUTION_CATEGORIES}/${categoryId.trim()}`, body);
      assertApiEnvelopeSuccess(res.data);
      return res.data;
    }
    const res = await api.post(ADMIN_SOLUTION_CATEGORIES, body);
    assertApiEnvelopeSuccess(res.data);
    return res.data;
  } catch {
    const fd = valuesToUpsertFormData(values, categoryId);
    const res = await api.post(ADMIN_TAXONOMY_CATEGORIES, fd);
    assertApiEnvelopeSuccess(res.data);
    return res.data;
  }
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
