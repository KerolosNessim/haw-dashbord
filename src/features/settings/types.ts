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

export type LocaleString = {
  ar: string;
  en: string;
};

export type AiToolsBoxSettings = {
  description: LocaleString;
  challenge_label: LocaleString;
  email_label: LocaleString;
  consent_label: LocaleString;
  button_text: LocaleString;
  service_ids: number[];
  is_active: boolean;
};

export type AiToolsBoxFormValues = {
  description_ar: string;
  description_en: string;
  challenge_label_ar: string;
  challenge_label_en: string;
  email_label_ar: string;
  email_label_en: string;
  consent_label_ar: string;
  consent_label_en: string;
  button_text_ar: string;
  button_text_en: string;
  service_ids: number[];
  is_active: boolean;
};
