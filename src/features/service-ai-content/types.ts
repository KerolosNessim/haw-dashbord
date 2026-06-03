import type { BilingualSectionImage } from "@/lib/bilingual-section-image";

export type LocalizedText = {
  ar: string;
  en: string;
};

export type ServiceAiContentItem = {
  video: string;
  preview_image: { ar: string | null; en: string | null };
  sort_order: number;
};

export type ServiceAiContentFormItem = {
  /** Stable React key for list rows (not sent to API). */
  clientId: string;
  video: string;
  preview_image: BilingualSectionImage;
  /** Set when user removes an existing locale image so save sends empty string. */
  clearPreview?: { ar: boolean; en: boolean };
};

export type ServiceAiContent = {
  id: number;
  title: LocalizedText;
  description: LocalizedText;
  items: ServiceAiContentItem[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ServiceAiContentFormValues = {
  title: LocalizedText;
  description: LocalizedText;
  items: ServiceAiContentFormItem[];
  is_active: boolean;
};
