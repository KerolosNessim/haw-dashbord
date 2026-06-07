import type { BlogSlugRedirectCode } from "@/lib/http-redirect-codes";
import { isBlogSlugRedirectCode, normalizeSlugRedirectCodeInput } from "@/lib/http-redirect-codes";

export type SiteLocale = "ar" | "en";

const LOCALE_PREFIX_RE = /^\/(ar|en)(?=\/|$)/i;

/** Removes a leading `/ar` or `/en` segment from a public path. */
export function stripLocalePathPrefix(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const stripped = withSlash.replace(LOCALE_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped;
}

export function ensureLeadingSlash(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Internal/public paths are stored without locale prefix; locale lives in a separate field. */
export function normalizeInternalSitePath(path: string): string {
  return ensureLeadingSlash(stripLocalePathPrefix(path));
}

export function slugFromInternalPath(path: string): string | null {
  const bare = normalizeInternalSitePath(path);
  const parts = bare.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1]! : null;
}

/** Arabic redirects should be permanent (301), not temporary (307), to avoid redirect chains. */
export function redirectCodeForLocale(locale: SiteLocale, code: unknown): BlogSlugRedirectCode {
  const normalized = normalizeSlugRedirectCodeInput(code);
  const resolved = normalized || "301";
  if (locale === "ar" && resolved === "307") return "301";
  return resolved;
}

export function isRedirectStatusCode(code: unknown): code is BlogSlugRedirectCode {
  return typeof code === "string" && isBlogSlugRedirectCode(code);
}
