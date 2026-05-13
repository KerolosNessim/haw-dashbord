export type LegalPageType = "privacy-policy" | "terms-of-use" | "refund-policy";

export interface LegalPage {
  id?: number;
  type: LegalPageType;
  image: string | null;
  description: {
    ar: string;
    en: string;
  };
  slug: string;
  meta_title: {
    ar: string;
    en: string;
  };
  meta_description: {
    ar: string;
    en: string;
  };
}

export interface LegalPageValues {
  image?: File | string | null;
  description_ar: string;
  description_en: string;
  slug?: string;
  meta_title_ar: string;
  meta_title_en: string;
  meta_description_ar: string;
  meta_description_en: string;
}
