/** HTTP status codes offered when configuring blog slug redirects (admin). */
export const BLOG_SLUG_REDIRECT_CODES = [
  "301",
  "302",
  "307",
  "308",
  "404",
  "410",
] as const;

export type BlogSlugRedirectCode = (typeof BLOG_SLUG_REDIRECT_CODES)[number];

export type SlugRedirectCodeValue = BlogSlugRedirectCode | "";

export function isBlogSlugRedirectCode(v: string): v is BlogSlugRedirectCode {
  return (BLOG_SLUG_REDIRECT_CODES as readonly string[]).includes(v);
}

export function normalizeSlugRedirectCodeInput(v: unknown): SlugRedirectCodeValue {
  if (v == null || v === "") return "";
  const s = typeof v === "number" ? String(v) : String(v).trim();
  return isBlogSlugRedirectCode(s) ? s : "";
}
