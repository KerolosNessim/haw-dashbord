/**
 * Maps common English API success messages to root i18n keys (`toasts.*`).
 * When `translate` is passed, known API text is localized; unknown API text uses `fallback`.
 */
const API_MESSAGE_I18N_KEYS: Record<string, string> = {
  "category updated successfully": "toasts.category_updated_successfully",
  "category created successfully": "toasts.category_created_successfully",
  "blog category updated successfully": "toasts.blog_category_updated_successfully",
  "blog category created successfully": "toasts.blog_category_created_successfully",
};

function extractApiMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return null;
}

/**
 * Resolves toast text from an API payload.
 * @param translate — root `useTranslation()` `t` to localize known API messages
 */
export function resolveApiToastMessage(
  data: unknown,
  fallback: string,
  translate?: (key: string) => string,
): string {
  const apiMsg = extractApiMessage(data);

  if (translate) {
    if (apiMsg) {
      const key = API_MESSAGE_I18N_KEYS[apiMsg.toLowerCase()];
      if (key) return translate(key);
    }
    return fallback;
  }

  if (apiMsg) return apiMsg;
  return fallback;
}
