export type LocalizedString = { ar: string; en: string };

export type PackageFeatureRow = {
  title: LocalizedString;
  is_included: boolean;
  sort_order: number;
};

export type PackageFormValues = {
  /** Countries where this package is visible (API: `country_ids[]`). */
  country_ids: string[];
  package_category_id: string;
  title: LocalizedString;
  description: LocalizedString;
  /** CTA label — API: `button_text[ar]`, `button_text[en]` (required) */
  button_text: LocalizedString;
  /** API: `slug[ar]`, `slug[en]` */
  slug: LocalizedString;
  is_featured: boolean;
  is_active: boolean;
  price: string;
  currency: string;
  features: PackageFeatureRow[];
  icon_alt: LocalizedString;
  /** Hydration-only: existing icon URL for edit preview — not sent on save */
  existing_icon_url?: string;
  /** Hydration-only: selected category label for edit fallback — not sent on save */
  categoryTitleAr?: string;
  categoryTitleEn?: string;
};

export type PackageRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  package_category_id: string;
  categoryTitle: string;
  is_featured: boolean;
  is_active: boolean;
};
