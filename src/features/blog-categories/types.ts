export type BlogCategoryRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  slugAr: string;
  slugEn: string;
  is_active: boolean;
};

/** Matches Postman admin blog-categories multipart (`parent_id`, `name[ar]`, …, `meta_description[en]`). */
export type BlogCategoryFormValues = {
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  slug: { ar: string; en: string };
  /** Empty string = no parent */
  parent_id: string;
  order_priority: number;
  is_active: boolean;
  is_featured: boolean;
  is_searchable: boolean;
  meta_title: { ar: string; en: string };
  meta_description: { ar: string; en: string };
};
