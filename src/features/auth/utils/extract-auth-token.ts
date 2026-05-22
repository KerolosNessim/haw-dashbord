/** Bearer value from admin login payloads (`token` or `accessToken`). */
export function extractAuthToken(
  data: Record<string, unknown> | null | undefined,
): string | null {
  if (!data || typeof data !== "object") return null;

  const candidates = [data.accessToken, data.token];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}
