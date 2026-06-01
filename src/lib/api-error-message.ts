/** Laravel-style { errors: { field: ["msg"] | "msg" } } */
export function flattenValidationErrors(
  errors: Record<string, string[] | string> | undefined | null,
): string[] {
  if (!errors || typeof errors !== "object") return [];
  const parts: string[] = [];
  for (const val of Object.values(errors)) {
    const msgs = Array.isArray(val) ? val : val != null ? [String(val)] : [];
    for (const m of msgs) {
      const trimmed = m?.trim();
      if (trimmed) parts.push(trimmed);
    }
  }
  return parts;
}

function flattenValidationErrorsWithKeys(
  errors: Record<string, string[] | string> | undefined | null,
): string[] {
  if (!errors || typeof errors !== "object") return [];
  const parts: string[] = [];
  for (const [field, val] of Object.entries(errors)) {
    const msgs = Array.isArray(val) ? val : val != null ? [String(val)] : [];
    for (const m of msgs) {
      const trimmed = m?.trim();
      if (!trimmed) continue;
      parts.push(field ? `${field}: ${trimmed}` : trimmed);
    }
  }
  return parts;
}

export function axiosResponseErrorSummary(responseData: unknown): string | null {
  if (!responseData || typeof responseData !== "object") return null;
  const data = responseData as {
    errors?: Record<string, string[] | string>;
    message?: string;
  };
  const fromFields = flattenValidationErrorsWithKeys(data.errors);
  if (fromFields.length === 1) return fromFields[0];
  if (fromFields.length > 1) return fromFields.join("\n");
  if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  return null;
}
