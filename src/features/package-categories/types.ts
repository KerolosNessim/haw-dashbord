export type LocalizedString = { ar: string; en: string };

export type PackageCategoryFormValues = {
  country_ids: string[];
  title: LocalizedString;
  slug: LocalizedString;
  sort_order: number;
  is_active: boolean;
};

export type PackageCategoryRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};
