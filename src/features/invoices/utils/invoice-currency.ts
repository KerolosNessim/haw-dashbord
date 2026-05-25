/** Default when catalog rows omit currency (Howeyah invoices). */
export const DEFAULT_INVOICE_CURRENCY = "SAR";

/** Laravel expects exactly 3 uppercase ISO 4217 letters per line item. */
export function normalizeInvoiceCurrency(raw: unknown): string {
  const trimmed = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;
  return DEFAULT_INVOICE_CURRENCY;
}
