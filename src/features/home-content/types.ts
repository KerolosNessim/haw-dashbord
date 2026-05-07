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
            created_at: string,
            updated_at: string
}

export interface StatsResponse {
  status: string;
  message: string;
  data: StatsData[];
};

// Accreditation — single item from GET /v1/admin/accreditations
export interface AccreditationData {
  id: number;
  title: LocaleString;
  description: LocaleString;
  images: { //array of image URLs
    id:number,
    url:string
  }[];        
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

// POST / PUT request body
export interface AccreditationRequest {
  title: LocaleString;
  description: LocaleString;
  image?: File | null;     // single image upload
};

// Full API Response — data is a single object
export interface AccreditationResponse {
  status: string;
  message: string;
  data: AccreditationData;
};
