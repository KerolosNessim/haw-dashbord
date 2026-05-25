import { api } from "@/lib/api";
import { readId, unwrapDataArray } from "@/lib/api-payload";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type {
  CreateInvoicePayload,
  InvoiceCatalogType,
  InvoiceDetail,
  InvoiceLineItem,
  InvoiceRow,
} from "../types";
import { normalizeInvoiceCurrency } from "../utils/invoice-currency";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function parseNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function normalizeLineItem(raw: unknown): InvoiceLineItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const type = r.type as InvoiceCatalogType;
  if (type !== "package" && type !== "service" && type !== "course") return null;
  const id = readId(r) || String(r.catalog_id ?? r.item_id ?? "");
  if (!id) return null;
  return {
    catalogKey: `${type}:${id}`,
    type,
    id,
    serviceNameAr: plainTextFromHtml(String(r.service_name_ar ?? r.title_ar ?? r.title ?? "")),
    serviceNameEn: plainTextFromHtml(String(r.service_name_en ?? r.title_en ?? r.title ?? "")),
    siteName: plainTextFromHtml(String(r.site_name ?? r.company_name ?? "")),
    cost: parseNumber(r.cost ?? r.price ?? r.amount),
    currency: typeof r.currency === "string" ? r.currency : "",
  };
}

function normalizeInvoiceRow(raw: unknown): InvoiceRow | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = readId(r);
  if (!id) return null;
  const lineItems = Array.isArray(r.line_items) ? r.line_items : Array.isArray(r.items) ? r.items : [];
  return {
    id,
    invoice_number: String(r.invoice_number ?? r.number ?? ""),
    client_name: String(r.client_name ?? r.name ?? ""),
    client_phone: String(r.client_phone ?? r.phone ?? ""),
    company_name: String(r.company_name ?? ""),
    subtotal: parseNumber(r.subtotal),
    discount: parseNumber(r.discount),
    tax: parseNumber(r.tax),
    total: parseNumber(r.total ?? r.total_due),
    currency: typeof r.currency === "string" ? r.currency : "",
    created_at: String(r.created_at ?? r.invoice_date ?? ""),
    line_items_count: parseNumber(r.line_items_count, lineItems.length),
  };
}

function normalizeInvoiceDetail(raw: unknown): InvoiceDetail | null {
  const row = normalizeInvoiceRow(raw);
  if (!row) return null;
  const r = asRecord(raw)!;
  const itemsRaw = Array.isArray(r.line_items) ? r.line_items : Array.isArray(r.items) ? r.items : [];
  const line_items = itemsRaw
    .map((item) => normalizeLineItem(item))
    .filter((x): x is InvoiceLineItem => x != null);
  return {
    ...row,
    line_items,
    line_items_count: line_items.length || row.line_items_count,
    notes_ar: typeof r.notes_ar === "string" ? r.notes_ar : undefined,
    notes_en: typeof r.notes_en === "string" ? r.notes_en : undefined,
  };
}

function pickMeta(payload: unknown) {
  const root = asRecord(payload);
  const dataRec = root ? asRecord(root.data) : null;
  const meta = asRecord(dataRec?.meta) ?? asRecord(root?.meta);
  return {
    current_page: parseNumber(meta?.current_page, 1),
    last_page: parseNumber(meta?.last_page, 1),
    per_page: parseNumber(meta?.per_page, 15),
    total: parseNumber(meta?.total, 0),
  };
}

export type InvoicesListResult = {
  rows: InvoiceRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export async function fetchInvoicesPage(params: {
  page?: number;
  search?: string;
}): Promise<InvoicesListResult> {
  const query: Record<string, string | number> = {};
  if (params.page && params.page > 0) query.page = params.page;
  if (params.search?.trim()) query.search = params.search.trim();

  const res = await api.get<unknown>("/v1/admin/invoices", { params: query });
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const rows = unwrapDataArray(body)
    .map((row) => normalizeInvoiceRow(row))
    .filter((x): x is InvoiceRow => x != null);

  return { rows, meta: pickMeta(res.data) };
}

export async function fetchInvoiceById(id: string): Promise<InvoiceDetail | null> {
  const res = await api.get<unknown>(`/v1/admin/invoices/${id}`);
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const entity = asRecord(body)?.data && typeof (body as Record<string, unknown>).data === "object"
    ? (body as Record<string, unknown>).data
    : body;
  return normalizeInvoiceDetail(entity);
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<InvoiceDetail> {
  const requestBody: CreateInvoicePayload = {
    ...payload,
    line_items: payload.line_items.map((item) => ({
      ...item,
      currency: normalizeInvoiceCurrency(item.currency),
    })),
  };
  const res = await api.post<unknown>("/v1/admin/invoices", requestBody);
  const body = (res.data as { data?: unknown })?.data ?? res.data;
  const detail = normalizeInvoiceDetail(body);
  if (!detail) throw new Error("Invalid invoice response");
  return detail;
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/v1/admin/invoices/${id}`);
}

/** Optional server PDF; falls back to client download when unavailable. */
export async function downloadInvoicePdfFromApi(id: string): Promise<Blob | null> {
  try {
    const res = await api.get(`/v1/admin/invoices/${id}/download`, {
      responseType: "blob",
    });
    if (res.data instanceof Blob) return res.data;
    return null;
  } catch {
    return null;
  }
}
