export interface LocaleString {
  ar: string;
  en: string;
}

export interface SolutionFeature {
  id: number;
  is_active: boolean;
  title: LocaleString;
  description: LocaleString;
  slug: LocaleString;
  image: string | null;
  images: string[];
  meta_title: LocaleString | null;
  meta_description: LocaleString | null;
}

export interface SolutionsData {
  id: number;
  slug: string;
  is_active: boolean;
    title: LocaleString;
    description: LocaleString;
}

export interface SolutionsResponse {
  status: string;
  message: string;
  data: SolutionsData;
}

export interface SolutionItemsResponse {
  status: string;
  message: string;
  data: {
    data: SolutionFeature[];
  };
}
