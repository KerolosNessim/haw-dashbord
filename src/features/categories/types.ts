export type CourseCategoryRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  slugAr: string;
  slugEn: string;
  coursesCount: number;
  isActive: boolean;
};

export type CourseCategoryPage = {
  rows: CourseCategoryRow[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};

export type CourseCategoryListParams = {
  page?: number;
  perPage?: number;
  search?: string;
};
