export type LocalizedString = {
  ar: string;
  en: string;
};

export type ServiceCatalogFormValues = {
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  slug: LocalizedString;
  sort_order: number;
  is_active: boolean;
};

export type ServiceCatalogRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  coverUrl: string | null;
};

export type ServiceCatalogDetail = {
  values: ServiceCatalogFormValues;
  coverUrl: string | null;
};
