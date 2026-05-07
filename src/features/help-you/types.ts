export interface LocaleString {
  ar: string;
  en: string;
}

export interface HelpYouItem {
  id: number;
  slug: string;
  is_active: boolean;
  order: number;
  content: {
    title: LocaleString;
    description: LocaleString;
  };
  image: string | null;
  seo: {
    meta_title: LocaleString | null;
    meta_description: LocaleString | null;
  };
}

export interface HelpYouResponse {
  status: string;
  message: string;
  data: HelpYouItem[];
}
