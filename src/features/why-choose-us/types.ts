export interface LocaleString {
  ar: string;
  en: string;
}

export interface WhyUsImageAlt {
  ar: string | null;
  en: string | null;
}

export interface WhyUsGalleryMedia {
  id: number;
  url: string;
  image_alt?: WhyUsImageAlt | null;
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
    image: string | LocaleString | null;
    images?: LocaleString | null;
    image_alt?: WhyUsImageAlt | null;
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
  media?: {
    image?: string | LocaleString | null;
    images?: LocaleString | null;
    image_alt?: WhyUsImageAlt | null;
  };
  /** Spatie gallery (section illustrations) */
  images?: WhyUsGalleryMedia[];
}

export interface WhyUsResponse {
  status: string;
  message: string;
  data: WhyUsData | WhyUsFeature[];
}

export interface WhyUsItemsResponse {
  status: string;
  message: string;
  data: {
    data: WhyUsFeature[];
  };
}
