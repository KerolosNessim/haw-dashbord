import type { BilingualImageAlt } from "@/lib/bilingual-image-alt";
import type { BilingualSectionImage } from "@/lib/bilingual-section-image";

export type SolutionCategoryRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  slugAr: string;
  slugEn: string;
  singlesCount: number;
  isActive: boolean;
};

export type SolutionCategoryFormValues = {
  name: { ar: string; en: string };
  slug: { ar: string; en: string };
  description: { ar: string; en: string };
  meta_title: { ar: string; en: string };
  meta_description: { ar: string; en: string };
  image: BilingualSectionImage;
  image_alt: BilingualImageAlt;
};

export type SolutionCategoryPage = {
  rows: SolutionCategoryRow[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

export type SolutionCategoryListParams = {
  page?: number;
  perPage?: number;
  search?: string;
};
