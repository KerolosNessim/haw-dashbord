import { isAxiosError } from "axios";

/** Best-effort message from Axios / Laravel `{ message }` JSON bodies */
export function getHttpErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const raw = error.response?.data;
    if (raw && typeof raw === "object") {
      const msg = (raw as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg)) return msg.map(String).join(", ");
    }
    if (error.response?.status) {
      const base = error.message || "Request failed";
      return `${base} (HTTP ${error.response.status})`;
    }
    return error.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Request failed";
}
