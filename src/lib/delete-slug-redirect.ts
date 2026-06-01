import type { BlogSlugRedirectCode } from "@/lib/http-redirect-codes";

/** Payload sent when deleting a slugged resource so the old URL keeps SEO behavior. */
export type DeleteSlugRedirectPayload = {
  slug_redirect_code: {
    ar: BlogSlugRedirectCode;
    en: BlogSlugRedirectCode;
  };
};

export const DEFAULT_DELETE_SLUG_REDIRECT_CODE: BlogSlugRedirectCode = "410";

export function appendDeleteSlugRedirectToFormData(
  fd: FormData,
  payload: DeleteSlugRedirectPayload,
): void {
  fd.append("slug_redirect_code[ar]", payload.slug_redirect_code.ar);
  fd.append("slug_redirect_code[en]", payload.slug_redirect_code.en);
}
