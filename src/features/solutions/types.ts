export interface LocaleString {
  ar: string;
  en: string;
}

export interface SolutionFeature {
  id?: number;
  is_active: boolean;
  title: LocaleString;
  description: LocaleString;
  slug: LocaleString;
  image: string | null;
  images: string[];
  meta_title: LocaleString | null;
  meta_description: LocaleString | null;
  category?: {
    id?: number;
    name?: LocaleString | string | null;
    slug?: LocaleString | string | null;
  } | null;
}

export interface SolutionsData {
  id: number;
  slug: string;
  is_active: boolean;
  title: LocaleString;
  /** API may expose section copy as `subtitle` (Postman) or legacy `description`. */
  subtitle?: LocaleString;
  description?: LocaleString;
}

export interface SolutionsResponse {
  status: string;
  message: string;
  data: SolutionsData;
}

export type SolutionsSectionSaveInput = {
  title_ar: string;
  title_en?: string;
  des_ar: string;
  des_en?: string;
};

export interface SolutionItemsResponse {
  status: string;
  message: string;
  data: SolutionFeature[];
}
