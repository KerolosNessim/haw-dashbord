import type { BlogSlugRedirectCode } from "@/lib/http-redirect-codes";

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
  fd.append("slug_redirect_code[ar]", payload.slug_redirect_code.ar);
  fd.append("slug_redirect_code[en]", payload.slug_redirect_code.en);
  const arTarget = payload.slug_redirect_target?.ar?.trim();
  const enTarget = payload.slug_redirect_target?.en?.trim();
  if (arTarget) fd.append("slug_redirect_target[ar]", arTarget);
  if (enTarget) fd.append("slug_redirect_target[en]", enTarget);
}

export function codeNeedsRedirectTarget(code: BlogSlugRedirectCode): boolean {
  return code === "301" || code === "302" || code === "307" || code === "308";
}
