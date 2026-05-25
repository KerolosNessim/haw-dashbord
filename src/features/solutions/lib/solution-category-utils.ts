import type { LocaleString, SolutionFeature } from "@/features/solutions/types";
import type { SolutionCategoryRow } from "@/features/solution-categories/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function localizedName(
  name: LocaleString | string | null | undefined,
  isRtl: boolean,
): string {
  if (!name) return "";
  if (typeof name === "string") return name.trim();
  const ar = (name.ar ?? "").trim();
  const en = (name.en ?? "").trim();
  return isRtl ? ar || en : en || ar;
}

function categoryDisplayName(
  category: SolutionFeature["category"],
  isRtl: boolean,
): string {
  if (!category) return "";
  const title = (category as { title?: LocaleString | string | null }).title;
  if (title) return localizedName(title, isRtl);
  return localizedName(category.name ?? null, isRtl);
}

/** Reads category id from API row (`category_id`, nested `category`, etc.). */
export function pickSolutionCategoryId(row: SolutionFeature | Record<string, unknown>): string {
  const r = row as Record<string, unknown>;
  const nested = asRecord(r.category);
  if (nested?.id != null && String(nested.id).trim()) return String(nested.id).trim();
  for (const key of ["category_id", "solution_category_id", "categoryId"] as const) {
    const v = r[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

export function solutionCategoryLabel(
  row: SolutionFeature,
  isRtl: boolean,
  categoryById: Map<string, SolutionCategoryRow>,
): string {
  const nested = row.category;
  const fromNested = categoryDisplayName(nested, isRtl);
  if (fromNested) return fromNested;
  const id = pickSolutionCategoryId(row);
  if (!id) return "";
  const cat = categoryById.get(id);
  if (!cat) return "";
  return isRtl ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr;
}
