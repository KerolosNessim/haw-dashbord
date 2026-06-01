import type { BilingualSectionImage } from "@/lib/bilingual-section-image";

/** Section payloads for unified POST (full overwrite on backend) */

export type BenefitsSectionData = {
  id?: number;
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  image?: BilingualSectionImage | File | string | null;
  image_alt?: { ar: string; en: string };  /** Optional — when set, the whole section is a link on the public site. */
  link?: string;
  sort_order?: number;
};

export type ListSectionItem = {
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  question?: { ar: string; en: string };
  answer?: { ar: unknown; en: unknown };
  button_text?: { ar: string; en: string };
  sort_order?: number;
  image?: BilingualSectionImage | File | string | null;
  /** Per-card URL — applies to this item only (offerings / full section cards). */
  link?: string;
  /** Optional icon slug for the public card (e.g. `search`, `megaphone`). */
  icon?: string;
};

export type ListSectionData = {
  id?: number;
  title?: { ar: string; en: string };
  description?: { ar: string; en: string };
  image?: BilingualSectionImage | File | string | null;
  image_alt?: { ar: string; en: string };
  link?: string;
  items?: ListSectionItem[];
  sort_order?: number;
};

export type FaqSectionData = ListSectionData;

export type ToolsSectionData = {
  id?: number;
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  sub_title?: { ar: string; en: string };
  sub_description?: { ar: unknown; en: unknown };
  link?: string;
  sort_order?: number;
};

export type PackagesSectionItem = {
  title?: { ar: string; en: string };
  description?: { ar: unknown; en: unknown };
  image?: BilingualSectionImage | File | string | null;
  image_alt?: { ar: string; en: string };
  price?: number;
  currency?: string;
  sort_order?: number;
  features?: { ar: string[]; en: string[] };
  /** Per-package URL on the public pricing cards. */
  link?: string;
};

export type PackagesSectionData = {
  id?: number;
  title?: { ar: string; en: string };
  description?: { ar: string; en: string };
  link?: string;
  items?: PackagesSectionItem[];
  sort_order?: number;
};

export interface ServiceSectionsPayload {
  benefits?: BenefitsSectionData[];
  steps?: ListSectionData[];
  faqs?: FaqSectionData[];
  offerings?: ListSectionData[];
  tools?: ToolsSectionData[];
  ctas?: Array<Record<string, unknown>>;
  audits?: ListSectionData[];
  packages?: PackagesSectionData[];
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
