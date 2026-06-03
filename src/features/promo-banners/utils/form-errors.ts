import { isAxiosError } from "axios";

export function extractLaravelFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};
  const data = error.response?.data;
  if (!data || typeof data !== "object") return {};
  const errors = (data as { errors?: Record<string, string[] | string> }).errors;
  if (!errors || typeof errors !== "object") return {};

  const out: Record<string, string> = {};
  for (const [field, val] of Object.entries(errors)) {
    const msg = Array.isArray(val) ? val[0] : val;
    if (typeof msg === "string" && msg.trim()) out[field] = msg.trim();
  }
  return out;
}
