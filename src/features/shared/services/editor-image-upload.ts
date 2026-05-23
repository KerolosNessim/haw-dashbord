import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const EDITOR_UPLOAD_PATH = "/v1/admin/uploads";

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

/**
 * Upload image for inline rich text (blogs, services, hero, packages, …).
 * Requires `POST /v1/admin/uploads` on the Laravel API (deploy EditorUploadController).
 */
export async function uploadEditorImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await api.post(EDITOR_UPLOAD_PATH, fd);
    const raw = pickUrlFromPayload(res.data);
    if (raw) return resolveMediaUrl(raw);
    throw new Error("Upload response did not include an image URL.");
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new Error(
        "Image upload API is not available on the server (404). Deploy the latest Laravel backend.",
      );
    }

    // Local dev only: allow editing when API is offline
    if (import.meta.env.DEV) {
      console.warn(`[editor] ${EDITOR_UPLOAD_PATH} failed; using inline data URL.`, error);
      return fileToDataUrl(file);
    }

    throw error;
  }
}
