import type { BlogTagFormValue } from "@/features/blogs/types/blog-tag";

export type ServiceTagFormValue = BlogTagFormValue;

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseBool(v: unknown, fallback: boolean): boolean {
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  return fallback;
}

function hasExplicitFollowField(rec: Record<string, unknown>): boolean {
  return (
    rec.follow !== undefined ||
    rec.is_followable !== undefined ||
    rec.allow_follow !== undefined
  );
}

function parseTagIndexAndFollow(rec: Record<string, unknown>): { index: boolean; follow: boolean } {
  if (rec.is_searchable !== undefined) {
    const searchable = parseBool(rec.is_searchable, true);
    return { index: searchable, follow: searchable };
  }

  const noIndex = rec.no_index ?? rec.noindex ?? rec.is_noindex;
  let index: boolean;
  if (noIndex === true || noIndex === 1 || noIndex === "1") {
    index = false;
  } else if (rec.allow_indexing === false || rec.indexable === false) {
    index = false;
  } else {
    index = parseBool(rec.index ?? rec.is_indexable ?? rec.allow_index, true);
  }

  if (hasExplicitFollowField(rec)) {
    return {
      index,
      follow: parseBool(rec.follow ?? rec.is_followable ?? rec.allow_follow, true),
    };
  }

  return { index, follow: index };
}

/** Normalizes API / legacy comma-separated values into form tag rows. */
export function normalizeServiceTagsFromApi(raw: unknown): ServiceTagFormValue[] {
  if (raw == null) return [];

  if (typeof raw === "string") {
    return raw
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, index: true, follow: true }));
  }

  if (!Array.isArray(raw)) return [];

  const out: ServiceTagFormValue[] = [];
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

    const { index, follow } = parseTagIndexAndFollow(rec);
    out.push({ name, index, follow });
  }
  return out;
}

export function appendServiceTagsToFormData(
  fd: FormData,
  tags: ServiceTagFormValue[],
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
