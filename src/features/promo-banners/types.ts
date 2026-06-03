import type { BilingualSectionImage } from "@/lib/bilingual-section-image";

export type LocalizedText = { ar: string; en: string };

export type PromoBannerSection = {
  id: number;
  eyebrow: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PromoBannerSlide = {
  id: number;
  sort_order: number;
  is_active: boolean;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  button_text: LocalizedText;
  button_link: LocalizedText;
  image: { ar: string | null; en: string | null };
  image_alt: LocalizedText;
  created_at?: string;
  updated_at?: string;
};

export type PromoSlideFormItem = {
  id?: number;
  is_active: boolean;
  badge_ar: string;
  badge_en: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  description_ar: string;
  description_en: string;
  button_text_ar: string;
  button_text_en: string;
  button_link_ar: string;
  button_link_en: string;
  image_alt_ar: string;
  image_alt_en: string;
  image: BilingualSectionImage;
};

export type PromoSectionFormValues = {
  eyebrow_ar: string;
  eyebrow_en: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  is_active: boolean;
};

export type PromoSlidesFormValues = {
  items: PromoSlideFormItem[];
};
