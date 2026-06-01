export type RowImportResult = {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
};

export type ImportResult = {
  blogs: { created: number; updated: number; failed: number };
  services: { created: number; updated: number; failed: number };
  legal: { updated: number; failed: number };
  faqGeneral: boolean;
  faqItems: { created: number; updated: number; failed: number };
  errors: string[];
};
