import { isAxiosError } from "axios";

/** Map Laravel nested keys (e.g. `headline.ar`) to flat form field names. */
function mapPortfolioFieldKey(field: string): string {
  if (field.startsWith("image.")) return "image";
  if (field.startsWith("view_all_link.")) {
    const locale = field.slice("view_all_link.".length);
    if (locale === "ar" || locale === "en") return `view_all_link_${locale}`;
  }
  if (field.startsWith("full_case_study_link.")) {
    const locale = field.slice("full_case_study_link.".length);
    if (locale === "ar" || locale === "en") return `full_case_study_link_${locale}`;
  }
  const dot = field.indexOf(".");
  if (dot === -1) return field;
  const base = field.slice(0, dot);
  const locale = field.slice(dot + 1);
  if (locale === "ar" || locale === "en") return `${base}_${locale}`;
  return field;
}

export function extractLaravelFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};
  const data = error.response?.data;
  if (!data || typeof data !== "object") return {};
  const errors = (data as { errors?: Record<string, string[] | string> }).errors;
  if (!errors || typeof errors !== "object") return {};

  const out: Record<string, string> = {};
  for (const [field, val] of Object.entries(errors)) {
    const msg = Array.isArray(val) ? val[0] : val;
    if (typeof msg === "string" && msg.trim()) {
      out[mapPortfolioFieldKey(field)] = msg.trim();
    }
  }
  return out;
}
