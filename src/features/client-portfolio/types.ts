import type { BilingualSectionImage } from "@/lib/bilingual-section-image";

export type LocalizedText = { ar: string; en: string };

export type PortfolioCategory = "healthcare" | "animals" | "food_retail";

export const PORTFOLIO_CATEGORIES: readonly PortfolioCategory[] = [
  "healthcare",
  "animals",
  "food_retail",
];

export type PortfolioMetric = LocalizedText;

export type LinkedService = {
  id: number;
  title: LocalizedText;
};

export type PortfolioSection = {
  id: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  view_all_link: LocalizedText;
  view_all_button_text: LocalizedText;
  view_all_card_title: LocalizedText;
  view_all_card_description: LocalizedText;
  view_all_card_button_text: LocalizedText;
  read_case_study_button_text: LocalizedText;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PortfolioItem = {
  id: number;
  category: PortfolioCategory;
  client_tag: LocalizedText;
  headline: LocalizedText;
  period: LocalizedText;
  client: LocalizedText;
  challenge: LocalizedText;
  what_we_did: LocalizedText;
  results: LocalizedText;
  metrics: PortfolioMetric[];
  image: { ar: string | null; en: string | null };
  image_alt: LocalizedText;
  full_case_study_link: LocalizedText;
  read_case_study_button_text: LocalizedText | null;
  service_ids: number[];
  services?: LinkedService[];
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PortfolioSectionFormValues = {
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  view_all_link_ar: string;
  view_all_link_en: string;
  view_all_button_text_ar: string;
  view_all_button_text_en: string;
  view_all_card_title_ar: string;
  view_all_card_title_en: string;
  view_all_card_description_ar: string;
  view_all_card_description_en: string;
  view_all_card_button_text_ar: string;
  view_all_card_button_text_en: string;
  read_case_study_button_text_ar: string;
  read_case_study_button_text_en: string;
  is_active: boolean;
};

export type PortfolioItemFormValues = {
  category: PortfolioCategory;
  client_tag_ar: string;
  client_tag_en: string;
  headline_ar: string;
  headline_en: string;
  period_ar: string;
  period_en: string;
  client_ar: string;
  client_en: string;
  challenge_ar: string;
  challenge_en: string;
  what_we_did_ar: string;
  what_we_did_en: string;
  results_ar: string;
  results_en: string;
  metrics: PortfolioMetric[];
  image: BilingualSectionImage;
  image_alt_ar: string;
  image_alt_en: string;
  full_case_study_link_ar: string;
  full_case_study_link_en: string;
  read_case_study_button_text_ar: string;
  read_case_study_button_text_en: string;
  serviceIds: number[];
  linkedServices: LinkedService[];
  sort_order: number;
  is_active: boolean;
};
