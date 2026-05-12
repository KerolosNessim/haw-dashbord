export type LocalizedString = { ar: string; en: string };

export type CourseFormValues = {
  title: LocalizedString;
  description: LocalizedString;
  /** Main price amount (storefront formats with optional `currency`). */
  price: string;
  /** Listed / old price for strikethrough on the storefront sidebar. */
  compare_price: string;
  /** ISO-style code, e.g. USD, OMR, SAR — storefront prepends to amounts when set. */
  currency: string;
  /** One learning outcome per line; AR/EN rows pair by index for the public API JSON. */
  objectives: LocalizedString;
};

export type CourseRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  priceLabel: string;
};

export type CourseDetailForForm = {
  values: CourseFormValues;
  coverUrl: string | null;
};

export type CourseSectionRow = {
  id: string;
  titleAr: string;
  titleEn: string;
  video_url: string;
  /** Shown in curriculum (e.g. `12 min` or `04:30`) when API returns `duration`. */
  duration: string;
  is_free: boolean;
  sort_order: number;
};

export type CourseSectionFormValues = {
  title: LocalizedString;
  video_url: string;
  duration: string;
  is_free: boolean;
  sort_order: number;
};
