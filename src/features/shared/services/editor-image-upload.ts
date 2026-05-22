import { api } from "@/lib/api";

const UPLOAD_PATHS = [
  { path: "/v1/admin/uploads", field: "file" },
  { path: "/v1/admin/uploads", field: "image" },
  { path: "/v1/admin/media", field: "file" },
  { path: "/v1/admin/media", field: "image" },
  { path: "/v1/admin/upload", field: "file" },
  { path: "/v1/admin/upload", field: "image" },
] as const;

function apiOriginFromEnv(): string {
  const raw = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  if (!raw) return "";
  return raw.replace(/\/?api$/i, "");
}

function resolveMediaUrl(raw: string): string {
  const path = raw.trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  const origin = apiOriginFromEnv();
  if (!origin) return path;
  return path.startsWith("/") ? `${origin}${path}` : `${origin}/${path}`;
}

function pickUrlFromPayload(data: unknown, depth = 0): string | null {
  if (data == null || depth > 4) return null;
  if (typeof data === "string" && data.trim()) {
    const s = data.trim();
    if (/^https?:\/\//i.test(s) || s.startsWith("/") || s.startsWith("data:")) return s;
    return null;
  }
  if (typeof data !== "object") return null;

  const o = data as Record<string, unknown>;
  const keys = ["url", "full_url", "path", "src", "file_url", "image_url", "original_url"];
  for (const key of keys) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }

  if (o.data != null) {
    const nested = pickUrlFromPayload(o.data, depth + 1);
    if (nested) return nested;
  }

  for (const value of Object.values(o)) {
    const nested = pickUrlFromPayload(value, depth + 1);
    if (nested) return nested;
  }

  return null;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Upload image for inline rich text; falls back to data URL if API has no upload route. */
export async function uploadEditorImage(file: File): Promise<string> {
  for (const { path, field } of UPLOAD_PATHS) {
    try {
      const fd = new FormData();
      fd.append(field, file);
      const res = await api.post(path, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const raw = pickUrlFromPayload(res.data);
      if (raw) return resolveMediaUrl(raw);
    } catch {
      /* try next candidate */
    }
  }

  return fileToDataUrl(file);
}
