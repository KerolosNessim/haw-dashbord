export type SlugLocale = "ar" | "en";

/**
 * URL-friendly Latin slug from free text.
 * - Lowercase + trim
 * - Whitespace sequences → single hyphen
 * - Removes characters that are not "word" characters (`\w`) and not hyphens
 * - Collapses multiple hyphens → one and trims leading/trailing hyphens
 */
export function slugify(text: string): string {
  const withHyphensFromSpaces = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const wordCharsAndHyphensOnly = withHyphensFromSpaces.replace(/[^\w-]+/g, "");
  return wordCharsAndHyphensOnly.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

/** Arabic (and digits) segments joined by hyphens; spaces → hyphens. */
export function slugifyAr(text: string): string {
  const spaced = text.trim().toLowerCase().replace(/\s+/g, "-");
  const allowed = spaced.replace(
    /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\d-]+/gu,
    "",
  );
  return allowed.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

export function slugifyForLocale(locale: SlugLocale, text: string): string {
  return locale === "ar" ? slugifyAr(text) : slugify(text);
}
