export type LocalizedText = {
  ar: string;
  en: string;
};

export type Author = {
  id: number;
  image: string | null;
  name: LocalizedText;
  job_title: LocalizedText;
  bio: LocalizedText;
  image_alt: LocalizedText;
  slug: LocalizedText;
  meta_title: LocalizedText;
  meta_description: LocalizedText;
  is_active: boolean;
};

export type AuthorFormValues = {
  name: LocalizedText;
  job_title: LocalizedText;
  bio: LocalizedText;
  image_alt: LocalizedText;
  slug: LocalizedText;
  meta_title: LocalizedText;
  meta_description: LocalizedText;
  is_active: boolean;
};

export type AuthorPaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  path: string;
};

export type AuthorListResult = {
  rows: Author[];
  meta: AuthorPaginationMeta;
};
