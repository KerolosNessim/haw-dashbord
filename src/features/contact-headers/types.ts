export type LocalizedString = {
  ar: string;
  en: string;
};

export type ContactHeaderCountry = {
  id: number;
  name: LocalizedString;
};

export type ContactHeader = {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
  sort_order: number;
  is_active: boolean;
  country_ids: number[];
  country_id?: number | null;
  countries?: ContactHeaderCountry[];
};

export type ContactHeaderFormValues = {
  country_ids: string[];
  title: LocalizedString;
  description: LocalizedString;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
  sort_order: number;
  is_active: boolean;
};

export type ContactHeaderApiResponse<T = unknown> = {
  status: string;
  message: string;
  data: T;
};
