import type { BlogSlugRedirectCode } from "@/lib/http-redirect-codes";
import { normalizeInternalSitePath, redirectCodeForLocale } from "@/lib/locale-path";

/** Payload sent when deleting a slugged resource so the old URL keeps SEO behavior. */
export type DeleteSlugRedirectPayload = {
  slug_redirect_code: {
    ar: BlogSlugRedirectCode;
    en: BlogSlugRedirectCode;
  };
  slug_redirect_target?: {
    ar?: string;
    en?: string;
  };
};

export const DEFAULT_DELETE_SLUG_REDIRECT_CODE: BlogSlugRedirectCode = "410";

export function appendDeleteSlugRedirectToFormData(
  fd: FormData,
  payload: DeleteSlugRedirectPayload,
): void {
  const arCode = redirectCodeForLocale("ar", payload.slug_redirect_code.ar);
  const enCode = redirectCodeForLocale("en", payload.slug_redirect_code.en);
  fd.append("slug_redirect_code[ar]", arCode);
  fd.append("slug_redirect_code[en]", enCode);
  const arTarget = normalizeInternalSitePath(payload.slug_redirect_target?.ar ?? "");
  const enTarget = normalizeInternalSitePath(payload.slug_redirect_target?.en ?? "");
  if (arTarget) fd.append("slug_redirect_target[ar]", arTarget);
  if (enTarget) fd.append("slug_redirect_target[en]", enTarget);
}

export function codeNeedsRedirectTarget(code: BlogSlugRedirectCode): boolean {
  return code === "301" || code === "302" || code === "307" || code === "308";
}
