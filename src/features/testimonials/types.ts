export interface LocaleString {
  ar: string;
  en: string;
}

export interface TestimonialsGeneralData {
  id: number;
  slug?: string;
  is_active: boolean;
  title: LocaleString;
  description: LocaleString;
  country_ids?: number[];
}

/** Full `/v1/admin/testimonials/content` payload (section + items). */
export interface TestimonialsContentData extends TestimonialsGeneralData {
  testimonials: TestimonialItemData[];
}

export interface TestimonialItemData {
  id: number;
  content: {
    name: LocaleString;
    job_title: LocaleString;
    content: LocaleString;
  };
  name: LocaleString;
  job_title: LocaleString;
  description: LocaleString;
  image: string | null;
  rate: number;
  sort_order: number;
  is_active: boolean;
  country_ids: number[];
}

export interface TestimonialsListData {
  testimonials: TestimonialItemData[];
}

export interface TestimonialsResponse<T> {
  status: string;
  message: string;
  data: T;
}
