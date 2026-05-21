import { htmlForMultipartApi } from "@/lib/html-for-multipart-api";

export type LocalizedText = { ar: string; en: string };

export function htmlFromUnknown(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "html" in value) {
    return String((value as { html?: string }).html ?? "");
  }
  return String(value);
}

export function appendLocalized(
  fd: FormData,
  prefix: string,
  value: Partial<LocalizedText> | null | undefined,
) {
  if (!value) return;
  if (value.ar != null && value.ar !== "") fd.append(`${prefix}[ar]`, value.ar);
  if (value.en != null && value.en !== "") fd.append(`${prefix}[en]`, value.en);
}

export function appendLocalizedHtml(
  fd: FormData,
  prefix: string,
  value: unknown,
  locale: "ar" | "en",
) {
  const html = htmlForMultipartApi(htmlFromUnknown(value));
  if (html) fd.append(`${prefix}[${locale}]`, html);
}

/** Appends `steps[0][title][ar]` style nested keys */
export function appendIndexedLocalized(
  fd: FormData,
  base: string,
  index: number,
  field: string,
  value: Partial<LocalizedText> | null | undefined,
) {
  if (!value) return;
  if (value.ar != null && value.ar !== "") {
    fd.append(`${base}[${index}][${field}][ar]`, value.ar);
  }
  if (value.en != null && value.en !== "") {
    fd.append(`${base}[${index}][${field}][en]`, value.en);
  }
}

export function appendIndexedField(
  fd: FormData,
  base: string,
  index: number,
  field: string,
  value: string | number,
) {
  fd.append(`${base}[${index}][${field}]`, String(value));
}

export function appendScalar(fd: FormData, key: string, value: unknown) {
  if (value == null || value === "") return;
  fd.append(key, String(value));
}
