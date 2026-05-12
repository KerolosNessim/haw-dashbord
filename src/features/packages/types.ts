export type LocalizedString = { ar: string; en: string };

export type IconPreset = "target" | "gem" | "rocket" | "none";

export type PackageFeatureRow = {
  title: LocalizedString;
  is_included: boolean;
  sort_order: number;
};

export type PackageFormValues = {
  package_category_id: string;
  title: LocalizedString;
  description: LocalizedString;
  button_text: LocalizedString;
  details_url: string;
  slug: string;
  canonical_url: string;
  is_featured: boolean;
  is_active: boolean;
  price: string;
  currency: string;
  icon_preset: IconPreset;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
  meta_keywords: LocalizedString;
  features: PackageFeatureRow[];
  /** Hydration-only: existing icon URL for edit preview — not sent on save */
  existing_icon_url?: string;
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
