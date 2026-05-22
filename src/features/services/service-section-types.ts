/** Section payloads for unified POST (full overwrite on backend) */

export type BenefitsSectionData = {
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  image?: File | string | null;
  image_alt?: { ar: string; en: string };
  sort_order?: number;
};

export type ListSectionItem = {
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  question?: { ar: string; en: string };
  answer?: { ar: unknown; en: unknown };
  button_text?: { ar: string; en: string };
  sort_order?: number;
  image?: File | string | null;
};

export type ListSectionData = {
  title?: { ar: string; en: string };
  description?: { ar: string; en: string };
  image?: File | string | null;
  image_alt?: { ar: string; en: string };
  items?: ListSectionItem[];
  sort_order?: number;
};

export type FaqSectionData = ListSectionData;

export type ToolsSectionData = {
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  sub_title?: { ar: string; en: string };
  sub_description?: { ar: unknown; en: unknown };
  sort_order?: number;
};

export type PackagesSectionItem = {
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  image?: File | string | null;
  image_alt?: { ar: string; en: string };
  price?: number;
  currency?: string;
  sort_order?: number;
  features?: { ar: string[]; en: string[] };
};

export type PackagesSectionData = {
  title?: { ar: string; en: string };
  description?: { ar: string; en: string };
  items?: PackagesSectionItem[];
  sort_order?: number;
};

export interface ServiceSectionsPayload {
  benefits?: BenefitsSectionData;
  steps?: ListSectionData;
  faqs?: FaqSectionData;
  offerings?: ListSectionData;
  tools?: ToolsSectionData;
  ctas?: Record<string, unknown>;
  audits?: ListSectionData;
  packages?: PackagesSectionData;
}

export const SECTION_TYPE_TO_API_KEY = {
  image_text: "benefits",
  full_section: "steps",
  faq: "faqs",
  cards: "offerings",
  dual_desc: "tools",
  contact: "ctas",
  packages: "packages",
  audits: "audits",
} as const;

export type SectionType = keyof typeof SECTION_TYPE_TO_API_KEY;
export type SectionApiKey = (typeof SECTION_TYPE_TO_API_KEY)[SectionType];
