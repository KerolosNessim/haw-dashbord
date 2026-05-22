export const OG_TYPE_OPTIONS = ["website", "article", "product"] as const;
export type OgType = (typeof OG_TYPE_OPTIONS)[number];

export const TWITTER_CARD_OPTIONS = ["summary", "summary_large_image"] as const;
export type TwitterCardType = (typeof TWITTER_CARD_OPTIONS)[number];

export function normalizeOgType(value: unknown): OgType {
  const v = String(value ?? "").trim();
  return (OG_TYPE_OPTIONS as readonly string[]).includes(v)
    ? (v as OgType)
    : "website";
}

export function normalizeTwitterCard(value: unknown): TwitterCardType {
  const v = String(value ?? "").trim();
  return (TWITTER_CARD_OPTIONS as readonly string[]).includes(v)
    ? (v as TwitterCardType)
    : "summary_large_image";
}
