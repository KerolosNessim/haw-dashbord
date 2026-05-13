import type { Country } from "../countries/types";

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface Service {
  id: number;
  slug: LocalizedString;
  image: string;
  title: LocalizedString;
  description: LocalizedString;
  highlight_description: LocalizedString;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
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
  };
}

export interface GetServiceResponse {
  status: string;
  message: string;
  data: Service;
}