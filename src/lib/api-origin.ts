const DEFAULT_STORAGE_ORIGIN = "https://howeyah.subcodeco.com";

/** Vercel dashboard uses same-origin `/api` rewrite — avoids Hostinger CDN blocking cross-site multipart. */
function shouldUseVercelApiProxy(): boolean {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  return (
    protocol === "https:" &&
    (hostname === "haw-dashbord.vercel.app" || hostname.endsWith(".vercel.app"))
  );
}

/** Laravel API base URL used by axios (`/api` on Vercel, full URL locally). */
export function apiBaseUrl(): string {
  if (shouldUseVercelApiProxy()) {
    return "/api";
  }

  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.PROD) return "/api";
  return "http://127.0.0.1:8000/api";
}

/**
 * Origin for `/storage/...` paths when `VITE_API_URL` is relative (`/api` behind Vercel proxy).
 * Set `VITE_API_ORIGIN` to override (e.g. staging API host).
 */
export function apiOriginFromEnv(): string {
  const explicit = (import.meta.env.VITE_API_ORIGIN as string | undefined)
    ?.trim()
    .replace(/\/$/, "");
  if (explicit) return explicit;

  const raw = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/$/, "");
  if (!raw || raw.startsWith("/")) {
    return DEFAULT_STORAGE_ORIGIN;
  }

  return raw.replace(/\/?api$/i, "");
}
