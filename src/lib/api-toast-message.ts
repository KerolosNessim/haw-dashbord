/**
 * Prefer a non-empty `message` from an API payload; otherwise use a translated fallback.
 * Avoids empty success toasts and reduces reliance on raw browser/network error strings.
 */
export function resolveApiToastMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return fallback;
}
