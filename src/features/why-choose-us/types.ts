export interface LocaleString {
  ar: string;
  en: string;
}

export interface WhyUsFeature {
  id: number;
  sort_order: number;
  is_active: boolean;
  content: {
    title: LocaleString;
    description: LocaleString;
  };
  media: {
    image: string;
  };
}

export interface WhyUsData {
  id: number;
  slug: string;
  is_active: boolean;
  content: {
    title: LocaleString;
    description: LocaleString;
  };
}

export interface WhyUsResponse {
  status: string;
  message: string;
  data: WhyUsData | WhyUsFeature[]; // It can be a single object or an array
}

export interface WhyUsItemsResponse {
  status: string;
  message: string;
  data: WhyUsFeature[];
}
