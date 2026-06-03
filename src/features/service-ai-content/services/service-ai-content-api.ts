import { api } from "@/lib/api";
import { localizedHtmlForApi } from "@/lib/localized-html-form";
import {
  emptyBilingualSectionImage,
  type BilingualSectionImage,
} from "@/lib/bilingual-section-image";
import type {
  LocalizedText,
  ServiceAiContent,
  ServiceAiContentFormValues,
  ServiceAiContentItem,
} from "../types";
import { isAxiosError } from "axios";

const BASE = "/v1/admin/service_ais/content";
const MAX_VIDEO_URL = 2048;

function pickLocalized(input: unknown): LocalizedText {
  if (typeof input === "string") return { ar: input, en: input };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ar: "", en: "" };
  const row = input as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : "",
    en: typeof row.en === "string" ? row.en : "",
  };
}

function pickImage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.url === "string") return row.url;
  if (typeof row.path === "string") return row.path;
  return null;
}

function pickPreviewImageUrls(row: Record<string, unknown>): { ar: string | null; en: string | null } {
  const fromPreview = row.preview_image;
  const fromImages = row.images;
  if (fromPreview && typeof fromPreview === "object" && !Array.isArray(fromPreview)) {
    const img = fromPreview as Record<string, unknown>;
    const ar = pickImage(img.ar);
    const en = pickImage(img.en);
    if (ar || en) return { ar, en };
  }
  if (fromImages && typeof fromImages === "object" && !Array.isArray(fromImages)) {
    const img = fromImages as Record<string, unknown>;
    return { ar: pickImage(img.ar), en: pickImage(img.en) };
  }
  if (typeof fromPreview === "string" && fromPreview.trim()) {
    return { ar: fromPreview, en: fromPreview };
  }
  return { ar: null, en: null };
}

function normalizeItem(raw: unknown, index: number): ServiceAiContentItem {
  const row = (raw ?? {}) as Record<string, unknown>;
  const videoRaw = row.video;
  const video =
    typeof videoRaw === "string"
      ? videoRaw
      : videoRaw && typeof videoRaw === "object" && !Array.isArray(videoRaw)
        ? pickLocalized(videoRaw).ar || pickLocalized(videoRaw).en
        : "";

  return {
    video,
    preview_image: pickPreviewImageUrls(row),
    sort_order: Number(row.sort_order ?? index),
  };
}

function extractPayload(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in data) {
    const payload = (data as { data?: unknown }).data;
    if (payload != null) return payload;
  }
  return data;
}

function normalizeContent(input: unknown): ServiceAiContent {
  const row = (extractPayload(input) ?? {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  return {
    id: Number(row.id ?? 0),
    title: pickLocalized(row.title),
    description: pickLocalized(row.description),
    items: itemsRaw.map(normalizeItem).sort((a, b) => a.sort_order - b.sort_order),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export function parseServiceAiContentResponse(data: unknown): ServiceAiContent {
  return normalizeContent(data);
}

export async function fetchServiceAiContent(): Promise<ServiceAiContent | null> {
  try {
    const res = await api.get(BASE);
    return normalizeContent(res.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

/**
 * `items[i][preview_image][ar|en]` — File on upload, existing URL/path string to retain, or "" to clear.
 */
function appendItemPreviewImage(
  fd: FormData,
  index: number,
  image: BilingualSectionImage,
  clearPreview?: { ar: boolean; en: boolean },
): void {
  const base = `items[${index}][preview_image]`;

  if (clearPreview?.ar) {
    fd.append(`${base}[ar]`, "");
  } else if (image.ar instanceof File) {
    fd.append(`${base}[ar]`, image.ar);
  } else if (typeof image.ar === "string" && image.ar.trim()) {
    fd.append(`${base}[ar]`, image.ar.trim());
  }

  if (clearPreview?.en) {
    fd.append(`${base}[en]`, "");
  } else if (image.en instanceof File) {
    fd.append(`${base}[en]`, image.en);
  } else if (typeof image.en === "string" && image.en.trim()) {
    fd.append(`${base}[en]`, image.en.trim());
  }
}

/** Multipart shape: title/description HTML, is_active, items[i][video|sort_order|preview_image]. */
function buildFormData(values: ServiceAiContentFormValues, options?: { omitTitle?: boolean }): FormData {
  const fd = new FormData();

  if (!options?.omitTitle) {
    fd.append("title[ar]", localizedHtmlForApi(values.title.ar));
    fd.append("title[en]", localizedHtmlForApi(values.title.en));
  }

  fd.append("description[ar]", localizedHtmlForApi(values.description.ar));
  fd.append("description[en]", localizedHtmlForApi(values.description.en));
  fd.append("is_active", values.is_active ? "1" : "0");

  values.items.forEach((item, index) => {
    fd.append(`items[${index}][video]`, item.video.trim().slice(0, MAX_VIDEO_URL));
    fd.append(`items[${index}][sort_order]`, String(index));
    appendItemPreviewImage(fd, index, item.preview_image, item.clearPreview);
  });

  return fd;
}

export async function createServiceAiContent(values: ServiceAiContentFormValues) {
  const res = await api.post(BASE, buildFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Singleton update — POST + `_method=PUT` so PHP/Laravel receive all `items[n]` keys.
 * True PUT often drops nested multipart fields (e.g. only `items[0]` and `items[1]`).
 */
export async function updateServiceAiContent(values: ServiceAiContentFormValues) {
  const fd = buildFormData(values);
  fd.append("_method", "PUT");
  const res = await api.post(BASE, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export function previewImageFromApiItem(item: ServiceAiContentItem): BilingualSectionImage {
  return {
    ar: item.preview_image.ar,
    en: item.preview_image.en,
  };
}
