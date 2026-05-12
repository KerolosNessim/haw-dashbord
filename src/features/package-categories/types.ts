export type LocalizedString = { ar: string; en: string };

export type PackageCategoryFormValues = {
  title: LocalizedString;
  slug: string;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
  meta_keywords: LocalizedString;
};

export type PackageCategoryRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
};
