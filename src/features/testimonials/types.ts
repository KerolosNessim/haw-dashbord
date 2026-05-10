export interface LocaleString {
  ar: string;
  en: string;
}

export interface TestimonialsGeneralData {
  id: number;
  slug: string;
  is_active: boolean;
    title: LocaleString;
    description: LocaleString;
}

export interface TestimonialItemData {
  id: number;
  content?: {
    name?: LocaleString | string;
    job_title?: LocaleString | string;
    content?: LocaleString | string;
  };
  name?: LocaleString | string;
  job_title?: LocaleString | string;
  description?: LocaleString | string;
  image: string | null;
  rate: number;
  sort_order: number;
}

export interface TestimonialsListData {
  id: number;
  content: {
    title: string;
    description: string;
  };
  testimonials: TestimonialItemData[];
}

export interface TestimonialsResponse<T> {
  status: string;
  message: string;
  data: T;
}
