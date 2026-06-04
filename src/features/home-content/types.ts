export interface LocaleString  {
  ar: string;
  en: string;
};

// Hero Content
export interface HeroContent {
  title: LocaleString;
  description: LocaleString;
  sub_description: LocaleString;
  image: string | null;
};

// Hero POST Request
export interface HeroRequest {
  title: LocaleString;
  description: LocaleString;
  sub_description: LocaleString;
  phone: string;
  image?: File | null;
};


// Main Data
export interface HeroData {
  id: number;
  slug: string;
  is_active: boolean;
  content: HeroContent;
  phone: string;
  /** Scope: which country sees this hero (backend). */
  country_id?: number | null;
};

// Full API Response
export interface HeroResponse {
  status: string; // ممكن تخليها boolean لو السيرفر بيبعت true مش "true"
  message: string;
  data: HeroData;
};


export interface StatsData {
            id: number,
            title: LocaleString,
            number:string,
            description: LocaleString,
            sort_order: number,
            is_active: boolean,
            country_id?: number | null,
            created_at: string,
            updated_at: string
}

export interface StatsResponse {
  status: string;
  message: string;
  data: StatsData[];
};

/** Bilingual image alt from GET /v1/admin/accreditations */
export interface AccreditationImageAlt {
  ar: string | null;
  en: string | null;
}

export interface AccreditationLinkedService {
  id: number;
  title: LocaleString;
}

/** Spatie media item from GET /v1/admin/accreditations */
export interface AccreditationMedia {
  id: number;
  url: string;
  image_alt: AccreditationImageAlt;
  service_ids?: number[];
  services?: AccreditationLinkedService[];
}

// Accreditation — single item from GET /v1/admin/accreditations
export interface AccreditationData {
  id: number;
  title: LocaleString;
  description: LocaleString;
  images: AccreditationMedia[];
  sort_order: number;
  is_active: boolean;
  country_id?: number | null;
  created_at: string;
  updated_at?: string;
};

// Full API Response — data is a single object
export interface AccreditationResponse {
  status: string;
  message: string;
  data: AccreditationData;
};

/** GET /v1/admin/partners — list wrapper with first item used in dashboard */
export interface PartnersResponse {
  status: string;
  message: string;
  data: {
    data: AccreditationData[];
  };
};
