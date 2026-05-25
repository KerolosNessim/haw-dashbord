import type { InvoiceLineItem } from "../types";

export function formatMoney(amount: number, currency = ""): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const base = n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency.trim() ? `${currency.trim()} ${base}` : base;
}

export function computeInvoiceTotals(
  lineItems: InvoiceLineItem[],
  discount = 0,
  tax = 0,
): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = lineItems.reduce((sum, row) => sum + (Number.isFinite(row.cost) ? row.cost : 0), 0);
  const safeDiscount = Math.max(0, Math.min(subtotal, discount));
  const afterDiscount = subtotal - safeDiscount;
  const safeTax = Math.max(0, tax);
  const total = afterDiscount + safeTax;
  return { subtotal, discount: safeDiscount, tax: safeTax, total };
}
