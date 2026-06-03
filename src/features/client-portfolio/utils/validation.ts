export function isValidPortfolioLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateSectionLinks(values: {
  view_all_link_ar: string;
  view_all_link_en: string;
}): Partial<Record<"view_all_link_ar" | "view_all_link_en", string>> {
  const errors: Partial<Record<"view_all_link_ar" | "view_all_link_en", string>> = {};
  if (!isValidPortfolioLink(values.view_all_link_ar)) errors.view_all_link_ar = "invalid";
  if (!isValidPortfolioLink(values.view_all_link_en)) errors.view_all_link_en = "invalid";
  return errors;
}
