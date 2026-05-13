export interface FaqResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface FaqItem {
  id: number;
  question: LocalizedString;
  answer: LocalizedString;
  sort_order: number;
  is_active: boolean;
}

export interface FaqGeneralData {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
  slug: string;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
  items: FaqItem[];
  is_active: boolean;
  created_at: string;
}

export interface UpdateFaqGeneralInput {
  title: LocalizedString;
  description: LocalizedString;
  meta_title: LocalizedString;
  meta_description: LocalizedString;
  slug: LocalizedString;
}

export interface CreateFaqItemInput {
  question: LocalizedString;
  answer: LocalizedString;
  is_active: boolean;
}
