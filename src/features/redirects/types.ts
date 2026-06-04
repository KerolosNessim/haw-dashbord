import type { BlogSlugRedirectCode } from "@/lib/http-redirect-codes";

export const REDIRECT_RESOURCE_TYPES = [
  "blog",
  "service",
  "service_catalog",
  "blog_category",
  "package",
  "package_category",
  "custom",
] as const;

export type RedirectResourceType = (typeof REDIRECT_RESOURCE_TYPES)[number] | string;
export type RedirectLocale = "ar" | "en";

export type RedirectRow = {
  id: string;
  source_path: string;
  source_slug?: string | null;
  source_locale: RedirectLocale;
  resource_type: RedirectResourceType;
  resource_id?: string | null;
  status_code: BlogSlugRedirectCode;
  target_path?: string | null;
  target_locale?: RedirectLocale | null;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RedirectFilters = {
  search?: string;
  resource_type?: string;
  status_code?: string;
  locale?: string;
  is_active?: string;
};

export type RedirectFormValues = {
  source_path: string;
  source_locale: RedirectLocale;
  resource_type: RedirectResourceType;
  resource_id?: string;
  status_code: BlogSlugRedirectCode;
  target_path?: string;
  target_locale?: RedirectLocale;
  is_active: boolean;
};
