/** ISO codes used in service package pricing (dashboard + API). */
export const SERVICE_PACKAGE_CURRENCIES = ["OMR", "SAR", "USD", "AED", "EUR", "KWD", "BHD", "QAR"] as const;

export type ServicePackageCurrency = (typeof SERVICE_PACKAGE_CURRENCIES)[number];

export function normalizePackageCurrency(value: unknown): string {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!code) return "OMR";
  if ((SERVICE_PACKAGE_CURRENCIES as readonly string[]).includes(code)) return code;
  return code;
}

export function packageCurrencyOptions(current?: string): string[] {
  const set = new Set<string>(SERVICE_PACKAGE_CURRENCIES);
  const extra = normalizePackageCurrency(current);
  if (extra && extra !== "OMR") set.add(extra);
  return [...set];
}
