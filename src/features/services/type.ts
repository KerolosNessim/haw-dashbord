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

export interface ServiceImageUrls {
  ar: string | null;
  en: string | null;
}

export interface ServiceImageAlt {
  ar: string;
  en: string;
}

export interface Service {
  id: number;
  slug: LocalizedString;
  image: ServiceImageUrls;
  image_alt?: ServiceImageAlt | null;
  title: LocalizedString;
  description: LocalizedString;
  highlight_description: LocalizedString;
  inside_desc?: LocalizedString;
  media_url: string | null;
  media_type: string | null;
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
  audits?: any;
  offerings?: any;
}

export type {
  BenefitsSectionData,
  FaqSectionData,
  ListSectionData,
  ServiceSectionsPayload,
  ToolsSectionData,
  SectionApiKey,
  SectionType,
} from "./service-section-types";

export { SECTION_TYPE_TO_API_KEY } from "./service-section-types";

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
