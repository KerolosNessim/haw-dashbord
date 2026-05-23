const DEFAULT_STORAGE_ORIGIN = "https://howeyah.subcodeco.com";

/**
 * API base URL for axios.
 * Production (Vercel): `/api` — vercel.json rewrites to howeyah.subcodeco.com (same-origin, no CORS).
 * Dev: local Laravel or VITE_API_URL=/api with vite proxy.
 */
export function apiBaseUrl(): string {
  if (import.meta.env.DEV) {
    const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    return (fromEnv || "http://127.0.0.1:8000/api").replace(/\/$/, "");
  }

  return "/api";
}

/**
 * Origin for `/storage/...` paths (media URLs are served from Laravel host, not Vercel).
 */
export function apiOriginFromEnv(): string {
  const explicit = (import.meta.env.VITE_API_ORIGIN as string | undefined)
    ?.trim()
    .replace(/\/$/, "");
  if (explicit) return explicit;

  if (import.meta.env.DEV) {
    const raw = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
    if (raw && !raw.startsWith("/")) {
      return raw.replace(/\/?api$/i, "");
    }
  }

  return DEFAULT_STORAGE_ORIGIN;
}
