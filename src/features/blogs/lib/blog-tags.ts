import type { BlogTagFormValue } from "@/features/blogs/types/blog-tag";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  return fallback;
}

/** Normalizes API / legacy comma-separated values into form tag rows. */
export function normalizeBlogTagsFromApi(raw: unknown): BlogTagFormValue[] {
  if (raw == null) return [];

  if (typeof raw === "string") {
    return raw
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, index: true, follow: true }));
  }

  if (!Array.isArray(raw)) return [];

  const out: BlogTagFormValue[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const name = item.trim();
      if (name) out.push({ name, index: true, follow: true });
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    const name = String(rec.name ?? rec.label ?? rec.tag ?? "").trim();
    if (!name) continue;

    if (rec.is_searchable !== undefined) {
      const searchable = parseBool(rec.is_searchable, true);
      out.push({ name, index: searchable, follow: searchable });
      continue;
    }

    out.push({
      name,
      index: parseBool(rec.index ?? rec.is_indexable ?? rec.allow_index, true),
      follow: parseBool(rec.follow ?? rec.is_followable ?? rec.allow_follow, true),
    });
  }
  return out;
}

export function appendBlogTagsToFormData(
  fd: FormData,
  tags: BlogTagFormValue[],
): void {
  tags
    .map((t) => ({
      name: t.name.trim(),
      index: t.index,
      follow: t.follow,
    }))
    .filter((t) => t.name.length > 0)
    .forEach((tag, index) => {
      fd.append(`tags[${index}][name]`, tag.name);
      fd.append(`tags[${index}][index]`, tag.index ? "1" : "0");
      fd.append(`tags[${index}][follow]`, tag.follow ? "1" : "0");
    });
}

/** Table display / legacy export: tag names only. */
export function blogTagNames(tags: BlogTagFormValue[]): string[] {
  return tags.map((t) => t.name.trim()).filter(Boolean);
}
