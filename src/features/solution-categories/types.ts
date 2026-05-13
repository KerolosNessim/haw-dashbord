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
