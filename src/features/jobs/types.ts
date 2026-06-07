import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";

export type LocalizedText = {
  ar: string;
  en: string;
};

export type LocalizedImageFile = {
  ar: File | null;
  en: File | null;
};

export type JobsHeader = {
  id?: number;
  title: LocalizedText;
  description: LocalizedText;
  meta_title: LocalizedText;
  meta_description: LocalizedText;
  image_alt: LocalizedText;
  image: { ar: string | null; en: string | null };
  is_active: boolean;
};

export type JobsHeaderFormValues = Omit<JobsHeader, "image">;

export type JobsSectionItem = {
  id?: number;
  title: LocalizedText;
  description: LocalizedText;
  image_alt: LocalizedText;
  image: { ar: string | null; en: string | null };
  sort_order?: number;
};

export type JobsSection = {
  id: number;
  section_type: string;
  name: LocalizedText;
  sort_order: number;
  is_active: boolean;
  items: JobsSectionItem[];
};

export type JobsSectionFormItem = Omit<JobsSectionItem, "image"> & {
  image: LocalizedImageFile;
  currentImage: { ar: string | null; en: string | null };
};

export type JobsSectionFormValues = {
  section_type: string;
  name: LocalizedText;
  sort_order: number;
  is_active: boolean;
  items: JobsSectionFormItem[];
};

export type JobOpening = {
  id: number;
  title: LocalizedText;
  slug: LocalizedText;
  description: LocalizedText;
  job_type: LocalizedText;
  linkedin_url: string;
  image_alt: LocalizedText;
  image: { ar: string | null; en: string | null };
  sort_order: number;
  is_active: boolean;
};

export type JobOpeningFormValues = Omit<JobOpening, "id" | "image">;

export type JobOpeningSummary = {
  id: number;
  title: LocalizedText;
};

export type JobApplication = {
  id: number;
  job_opening_id: number | null;
  job_opening: JobOpeningSummary | null;
  name: string;
  email: string;
  age: number | null;
  cv_file_url: string | null;
  status: string;
  created_at: string;
};

export type JobApplicationListResult = {
  rows: JobApplication[];
  meta: LaravelPaginationMeta;
};
