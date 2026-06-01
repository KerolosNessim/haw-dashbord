export interface GeneralSettings {
  site_name_ar: string;
  site_name_en: string;
  site_description_ar: string;
  site_description_en: string;
  logo: string;
  favicon: string;
  timezone: string;
  default_language: "ar" | "en";
}

export interface PhoneItem {
  label: string;
  number: string;
  type: "phone" | "whatsapp" | "mobile";
}

export interface ContactSettings {
  email?: string | null;
  phones?: PhoneItem[];
  courses_phone?: string | null;
  address_ar?: string | null;
  address_en?: string | null;
}

export interface Office {
  id: number;
  title_ar: string;
  title_en: string;
  address_ar: string;
  address_en: string;
}

export interface WorkingHours {
  from_day: string;
  to_day: string;
  from_hour: string;
  to_hour: string;
  show_on_site: boolean;
}

export interface SocialMedia {
  id: number;
  platform: string;
  link: string;
  is_active: boolean;
}

export interface SeoSettings {
  id: number | string;
  page_key?: string;
  name_ar: string;
  name_en: string;
  metaTitle_ar: string;
  metaTitle_en: string;
  description_ar: string;
  description_en: string;
}

export interface AllSettings {
  general: GeneralSettings;
  contact: ContactSettings;
  offices: Office[];
  working_hours: WorkingHours;
  social_media: SocialMedia[];
  seo: SeoSettings[];
}

export interface SettingsResponse {
  status: string;
  message: string;
  data: AllSettings;
}

export interface ScriptsSettings {
  custom_head_scripts: string;
  custom_body_scripts: string;
  robots_txt: string;
}

export interface ScriptsResponse {
  status: string;
  message: string;
  data: ScriptsSettings;
}
