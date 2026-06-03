import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { normalizeInvoiceCurrency } from "./invoice-currency";

const TITLE_BY_CURRENCY: Record<string, string> = {
  SAR: "فاتورة مبيعات - السعودية",
  OMR: "فاتورة مبيعات- سلطنة عمان",
};

const TITLE_EN_BY_CURRENCY: Record<string, string> = {
  SAR: "Sales Invoice - Saudi Arabia",
  OMR: "Sales Invoice - Oman",
};

/** Arabic sales invoice title derived from line-item / invoice currency. */
export function getInvoiceHeaderTitle(currency: string): string {
  const code = normalizeInvoiceCurrency(currency);
  return TITLE_BY_CURRENCY[code] ?? "فاتورة مبيعات";
}

export function getInvoiceHeaderTitleEn(currency: string): string {
  const code = normalizeInvoiceCurrency(currency);
  return TITLE_EN_BY_CURRENCY[code] ?? "Sales Invoice";
}

export function formatInvoiceNumberDisplay(invoiceNumber: string): string {
  const trimmed = invoiceNumber.trim();
  return trimmed || "—";
}

/** Spaced digits for compact displays when needed. */
export function formatInvoiceNumberForHeader(invoiceNumber: string): string {
  const digits = invoiceNumber.replace(/\D/g, "");
  if (!digits) return "—";
  return digits.split("").join(" ");
}

/** dd/MM/yyyy for numeric date lines. */
export function formatInvoiceHeaderDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

/** Arabic long date for the meta bar, e.g. 25 مايو 2026. */
export function formatInvoiceMetaDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return format(parsed, "d MMMM yyyy", { locale: arSA });
  }

  return trimmed;
}
