import { api } from "@/lib/api";
import { pickLocalized, readId, unwrapDataArray } from "@/lib/api-payload";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { InvoiceCatalogOption, InvoiceCatalogType } from "../types";
import { normalizeInvoiceCurrency } from "../utils/invoice-currency";

function parsePrice(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const n = Number(raw.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function readCurrency(r: Record<string, unknown>): string {
  const c = r.currency ?? r.currency_code;
  return normalizeInvoiceCurrency(typeof c === "string" ? c : "");
}

function catalogOption(
  type: InvoiceCatalogType,
  id: string,
  labelAr: string,
  labelEn: string,
  price: number,
  currency: string,
): InvoiceCatalogOption {
  return {
    key: `${type}:${id}`,
    type,
    id,
    labelAr: labelAr || labelEn,
    labelEn: labelEn || labelAr,
    price,
    currency,
  };
}

function optionsFromRecords(
  records: unknown[],
  type: InvoiceCatalogType,
): InvoiceCatalogOption[] {
  const out: InvoiceCatalogOption[] = [];
  for (const raw of records) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = readId(r);
    if (!id) continue;
    const labelAr = plainTextFromHtml(
      pickLocalized(r.title, "ar") || pickLocalized(r.name, "ar"),
    );
    const labelEn = plainTextFromHtml(
      pickLocalized(r.title, "en") || pickLocalized(r.name, "en"),
    );
    const price = parsePrice(r.price ?? r.amount ?? r.cost);
    out.push(catalogOption(type, id, labelAr, labelEn, price, readCurrency(r)));
  }
  return out;
}

async function fetchPackageCatalog(): Promise<InvoiceCatalogOption[]> {
  const urls = ["/v1/admin/packages", "/v1/packages"];
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url, { params: { per_page: 200 } });
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return optionsFromRecords(unwrapDataArray(body), "package");
    } catch {
      /* try next */
    }
  }
  return [];
}

async function fetchCourseCatalog(): Promise<InvoiceCatalogOption[]> {
  const urls = ["/v1/admin/courses", "/v1/courses"];
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url);
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      return optionsFromRecords(unwrapDataArray(body), "course");
    } catch {
      /* try next */
    }
  }
  return [];
}

async function fetchServiceCatalog(): Promise<InvoiceCatalogOption[]> {
  const urls = ["/v1/admin/services", "/v1/services"];
  for (const url of urls) {
    try {
      const res = await api.get<unknown>(url);
      const body = (res.data as { data?: unknown })?.data ?? res.data;
      const rows = unwrapDataArray(body);
      const out: InvoiceCatalogOption[] = [];
      for (const raw of rows) {
        if (!raw || typeof raw !== "object") continue;
        const r = raw as Record<string, unknown>;
        const id = readId(r);
        if (!id) continue;
        const labelAr = plainTextFromHtml(pickLocalized(r.title, "ar"));
        const labelEn = plainTextFromHtml(pickLocalized(r.title, "en"));
        let price = 0;
        let currency = readCurrency(r);
        const packages = r.packages;
        if (packages && typeof packages === "object" && !Array.isArray(packages)) {
          const items = (packages as Record<string, unknown>).items;
          if (Array.isArray(items) && items.length > 0) {
            const first = items[0] as Record<string, unknown>;
            price = parsePrice(first.price);
            currency = readCurrency(first);
          }
        }
        out.push(catalogOption("service", id, labelAr, labelEn, price, currency));
      }
      return out;
    } catch {
      /* try next */
    }
  }
  return [];
}

export async function fetchInvoiceCatalogOptions(): Promise<InvoiceCatalogOption[]> {
  const [packages, courses, services] = await Promise.all([
    fetchPackageCatalog(),
    fetchCourseCatalog(),
    fetchServiceCatalog(),
  ]);
  return [...packages, ...courses, ...services];
}

export function buildLineItemsFromKeys(
  catalogKeys: string[],
  options: InvoiceCatalogOption[],
  companyName: string,
  locale: "ar" | "en",
): import("../types").InvoiceLineItem[] {
  const byKey = new Map(options.map((o) => [o.key, o]));
  return catalogKeys
    .map((key) => byKey.get(key))
    .filter((o): o is InvoiceCatalogOption => Boolean(o))
    .map((o) => ({
      catalogKey: o.key,
      type: o.type,
      id: o.id,
      serviceNameAr: o.labelAr,
      serviceNameEn: o.labelEn,
      siteName: companyName.trim() || "—",
      cost: o.price,
      currency: normalizeInvoiceCurrency(o.currency),
    }));
}
