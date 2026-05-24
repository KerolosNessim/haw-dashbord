/** Keys must match `pageKey` used on the public frontend (`buildStaticPageMetadata`). */
export const SEO_PAGE_KEYS = [
  "home",
  "about",
  "services",
  "packages",
  "clients",
  "courses",
  "faq",
  "blog",
  "contact-us",
] as const;

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number];

export function isSeoPageKey(value: string): value is SeoPageKey {
  return (SEO_PAGE_KEYS as readonly string[]).includes(value);
}
