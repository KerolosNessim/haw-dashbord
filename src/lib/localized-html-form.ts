import { editorOnChangeToHtml } from "@/features/shared/components/editor";
import { htmlForMultipartApi } from "@/lib/html-for-multipart-api";

/** Normalize editor output or raw HTML for multipart API fields. */
export function localizedHtmlForApi(value: unknown): string {
  const raw =
    value != null && typeof value === "object" && "html" in value
      ? editorOnChangeToHtml(value)
      : typeof value === "string"
        ? value
        : editorOnChangeToHtml(value);
  return htmlForMultipartApi(raw);
}

/** Appends `prefix[ar]` / `prefix[en]` as sanitized HTML (e.g. `description`, `site_description`). */
export function appendLocalizedDescriptionHtml(
  fd: FormData,
  prefix: string,
  ar: unknown,
  en: unknown,
) {
  const arHtml = localizedHtmlForApi(ar);
  const enHtml = localizedHtmlForApi(en);
  if (arHtml) fd.append(`${prefix}[ar]`, arHtml);
  if (enHtml) fd.append(`${prefix}[en]`, enHtml);
}
