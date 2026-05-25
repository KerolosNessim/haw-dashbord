import { plainTextFromHtml } from "@/lib/plain-text-from-html";

export function invoiceDisplayText(value: string | undefined | null): string {
  return plainTextFromHtml(value);
}
