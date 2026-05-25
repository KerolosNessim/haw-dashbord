/** 8-character invoice id derived from a UUID (client-generated before save). */
export function generateInvoiceNumber(): string {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return raw.slice(0, 8).toUpperCase();
}
