import { isAxiosError } from "axios";
import { axiosResponseErrorSummary } from "@/lib/api-error-message";

export type HttpErrorFallbacks = Partial<
  Record<401 | 403 | 404 | 422 | 500, string>
> & {
  default?: string;
  network?: string;
};

/** Best-effort message from Axios / Laravel JSON or plain-text bodies. */
export function getHttpErrorMessage(
  error: unknown,
  options?: HttpErrorFallbacks,
): string {
  const defaultMsg = options?.default ?? "Request failed";

  if (!isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) return error.message;
    return defaultMsg;
  }

  if (!error.response) {
    return options?.network ?? defaultMsg;
  }

  const { status, data, headers } = error.response;

  const server = String(headers?.server ?? headers?.Server ?? "").toLowerCase();
  const contentType = String(headers?.["content-type"] ?? "").toLowerCase();
  if (
    status === 403 &&
    (server.includes("hcdn") || (contentType.includes("text/plain") && typeof data === "string"))
  ) {
    return (
      options?.[403] ??
      "Request blocked by the hosting firewall (CDN). Contact your host to allow API requests from the dashboard."
    );
  }

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  const summary = axiosResponseErrorSummary(data);
  if (summary) return summary;

  if (status === 401 && options?.[401]) return options[401];
  if (status === 403 && options?.[403]) return options[403];
  if (status === 404 && options?.[404]) return options[404];
  if (status === 422 && options?.[422]) return options[422];
  if (status && status >= 500 && options?.[500]) return options[500];

  if (status) return `${defaultMsg} (HTTP ${status})`;
  return error.message?.trim() || defaultMsg;
}
