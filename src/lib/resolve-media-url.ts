import { apiOriginFromEnv } from "@/lib/api-origin";

export { apiOriginFromEnv };

function preferHttpsForKnownHosts(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:") return url;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "howeyah.subcodeco.com" ||
      host.endsWith(".howeyah.com") ||
      host === "howeyah.com"
    ) {
      parsed.protocol = "https:";
      return parsed.toString();
    }
  } catch {
    /* ignore */
  }
  return url;
}

export function resolveMediaUrl(raw: string): string {
  const path = raw.trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return preferHttpsForKnownHosts(path);
  }
  const origin = apiOriginFromEnv();
  const resolved = origin
    ? path.startsWith("/")
      ? `${origin}${path}`
      : `${origin}/${path}`
    : path;
  return preferHttpsForKnownHosts(resolved);
}

/** Extract a URL string from API shapes: plain string, `{ url }`, localized object, etc. */
export function pickImageUrlFromUnknown(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const s = value.trim();
    return s ? resolveMediaUrl(s) : null;
  }
  if (typeof value !== "object") return null;

  const o = value as Record<string, unknown>;
  for (const key of ["url", "full_url", "path", "src", "file_url", "image_url", "original_url"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return resolveMediaUrl(v.trim());
  }
  return null;
}

/** Preview URL for `<img src>` (skips `File`; use object URLs in the component for uploads). */
export function resolveImagePreviewFromUnknown(value: unknown): string | null {
  if (value instanceof File) return null;
  return pickImageUrlFromUnknown(value);
}

export function pickLocalizedImageUrls(
  image: unknown,
  images?: unknown,
): { ar: string | null; en: string | null } {
  const fromImage =
    image && typeof image === "object" && !Array.isArray(image)
      ? (image as { ar?: unknown; en?: unknown })
      : null;

  let ar = fromImage ? pickImageUrlFromUnknown(fromImage.ar) : pickImageUrlFromUnknown(image);
  let en = fromImage ? pickImageUrlFromUnknown(fromImage.en) : null;

  if ((!ar || !en) && images && typeof images === "object" && !Array.isArray(images)) {
    const imgs = images as { ar?: unknown; en?: unknown };
    if (!ar) ar = pickImageUrlFromUnknown(imgs.ar);
    if (!en) en = pickImageUrlFromUnknown(imgs.en);
  }

  return { ar: ar ?? null, en: en ?? null };
}
