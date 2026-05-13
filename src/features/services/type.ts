import type { Country } from "../countries/types";

export interface LocalizedString {
  ar: string;
  en: string;
}

export type LocalizedField = LocalizedString | string;

export interface ServicesListPayload {
  data: Service[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface GetServicesApiRaw {
  status: string;
  message: string;
  data: ServicesListPayload | Service[];
}

export interface Service {
  id: number;
  slug: LocalizedField;
  image: string;
  title: LocalizedField;
  description: LocalizedField;
  highlight_description: LocalizedField;
  media_url?: string;
  media_type?: string;
  meta_title: LocalizedField;
  meta_description: LocalizedField;
  is_active: boolean;
  show_footer: boolean;
  sort_order: number;
  countries: Country[];
  created_at: string;

  // Sections (Optional)
  benefits?: any;
  faqs?: any;
  packages?: any;
  steps?: any;
  tools?: any;
  ctas?: any;
}

export interface GetServicesResponse {
  status: string;
  message: string;
  data: {
    data: Service[];
    meta?: ServicesListPayload["meta"];
  };
  meta?: ServicesListPayload["meta"];
}

export interface GetServiceResponse {
  status: string;
  message: string;
  data: Service;
}
