export type InvoiceCatalogType = "package" | "service" | "course";

export type InvoiceCatalogOption = {
  /** Stable key: `package:12`, `service:3`, `course:uuid` */
  key: string;
  type: InvoiceCatalogType;
  id: string;
  labelAr: string;
  labelEn: string;
  price: number;
  currency: string;
};

export type InvoiceLineItem = {
  catalogKey: string;
  type: InvoiceCatalogType;
  id: string;
  serviceNameAr: string;
  serviceNameEn: string;
  siteName: string;
  cost: number;
  currency: string;
};

export type InvoiceFormDraft = {
  invoice_number: string;
  client_name: string;
  client_phone: string;
  company_name: string;
  catalog_keys: string[];
  discount: number;
  tax: number;
};

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  client_name: string;
  client_phone: string;
  company_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  created_at: string;
  line_items_count: number;
};

export type InvoiceDetail = InvoiceRow & {
  line_items: InvoiceLineItem[];
  notes_ar?: string;
  notes_en?: string;
};

export type CreateInvoicePayload = {
  invoice_number: string;
  client_name: string;
  client_phone: string;
  company_name: string;
  discount?: number;
  tax?: number;
  line_items: Array<{
    type: InvoiceCatalogType;
    id: string;
    cost: number;
    /** ISO 4217, 3 letters (e.g. SAR) */
    currency: string;
  }>;
};
