import type { WhyUsGalleryMedia, WhyUsImageAlt } from "../types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function pickUrl(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const r = asRecord(raw);
  if (!r) return "";
  for (const key of ["url", "original_url", "full_url", "src", "path"]) {
    const v = r[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickAlt(raw: unknown): WhyUsImageAlt | null {
  const r = asRecord(raw);
  if (!r) return null;
  if ("ar" in r || "en" in r) {
    return {
      ar: typeof r.ar === "string" ? r.ar : null,
      en: typeof r.en === "string" ? r.en : null,
    };
  }
  return null;
}

function normalizeGalleryItem(raw: unknown, fallbackId: number): WhyUsGalleryMedia | null {
  const r = asRecord(raw);
  if (!r) return null;

  const url = pickUrl(raw) || pickUrl(r.file) || pickUrl(r.media);
  if (!url) return null;

  const id =
    typeof r.id === "number"
      ? r.id
      : typeof r.id === "string" && r.id.trim()
        ? Number(r.id)
        : fallbackId;

  if (!Number.isFinite(id)) return null;

  return {
    id,
    url,
    image_alt: pickAlt(r.image_alt ?? r.alt),
  };
}

function normalizeGalleryList(raw: unknown): WhyUsGalleryMedia[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => normalizeGalleryItem(item, index + 1))
    .filter((x): x is WhyUsGalleryMedia => x != null);
}

/**
 * Reads gallery media from admin/public Why Choose Us payloads.
 * Backend may expose `images`, `gallery`, nested `media.images` (array), or Spatie `media[]`.
 */
export function pickWhyUsGalleryFromApi(data: unknown): WhyUsGalleryMedia[] {
  const root = asRecord(data);
  if (!root) return [];

  const direct = root.images ?? root.gallery ?? root.gallery_images;
  if (Array.isArray(direct)) {
    const list = normalizeGalleryList(direct);
    if (list.length > 0) return list;
  }

  const media = root.media;
  if (Array.isArray(media)) {
    const fromCollection = media.filter((item) => {
      const r = asRecord(item);
      const name = typeof r?.collection_name === "string" ? r.collection_name : "";
      return name === "images" || name === "gallery" || name === "default";
    });
    const list = normalizeGalleryList(fromCollection.length > 0 ? fromCollection : media);
    if (list.length > 0) return list;
  }

  const mediaRec = asRecord(media);
  if (mediaRec) {
    const nested = mediaRec.images ?? mediaRec.gallery;
    if (Array.isArray(nested)) {
      return normalizeGalleryList(nested);
    }
  }

  return [];
}

export function mergeWhyUsGalleryPreserved(
  previous: WhyUsGalleryMedia[] | undefined,
  next: WhyUsGalleryMedia[],
): WhyUsGalleryMedia[] {
  if (next.length > 0) return next;
  return previous ?? [];
}

export function extractWhyUsSectionData(data: unknown): Record<string, unknown> | null {
  const root = asRecord(data);
  if (!root) return null;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}

/** Patches `images` on cached GET / POST envelope while keeping other fields from the server. */
export function patchWhyUsCacheImages(
  cached: unknown,
  images: WhyUsGalleryMedia[],
): unknown {
  const root = asRecord(cached);
  if (!root) return cached;
  const section = extractWhyUsSectionData(cached);
  if (!section) return cached;

  const nextSection = { ...section, images };
  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return { ...root, data: { ...root.data, images } };
  }
  return { ...root, ...nextSection, images };
}

export type GalleryFormSnapshot = {
  existing: { id: number; url: string; alt: { ar: string; en: string } }[];
  newImages: { preview: string; alt: { ar: string; en: string } }[];
  deletedIds: number[];
};

export function buildGallerySnapshotFromForm({
  existing,
  newImages,
  deletedIds,
}: GalleryFormSnapshot): WhyUsGalleryMedia[] {
  const kept = existing
    .filter((img) => !deletedIds.includes(img.id))
    .map((img) => ({
      id: img.id,
      url: img.url,
      image_alt: { ar: img.alt.ar, en: img.alt.en },
    }));

  const added = newImages.map((img, index) => ({
    id: -(Date.now() + index),
    url: img.preview,
    image_alt: { ar: img.alt.ar, en: img.alt.en },
  }));

  return [...kept, ...added];
}
