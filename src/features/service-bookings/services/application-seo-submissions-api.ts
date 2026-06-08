import { api } from "@/lib/api";
import type {
  ApplicationSeoSubmission,
  ApplicationSeoSubmissionsListMeta,
  ApplicationSeoSubmissionsResponse,
} from "../types/application-seo-submission";

const SUBMISSIONS_PATH = "/v1/admin/application-seo/submissions";

function normalizeSubmission(raw: unknown): ApplicationSeoSubmission | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    service_id: Number(row.service_id ?? 0) || 0,
    service_title: typeof row.service_title === "string" ? row.service_title : "",
    website_url: typeof row.website_url === "string" ? row.website_url : "",
    email: typeof row.email === "string" ? row.email : "",
    consent: row.consent === true || row.consent === 1 || row.consent === "1",
    status: typeof row.status === "string" ? row.status : "new",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

function normalizeListMeta(raw: unknown): ApplicationSeoSubmissionsListMeta {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    current_page: Number(row.current_page ?? 1) || 1,
    last_page: Number(row.last_page ?? 1) || 1,
    per_page: Number(row.per_page ?? 20) || 20,
    total: Number(row.total ?? 0) || 0,
  };
}

function normalizeSubmissionsListPayload(
  body: unknown,
): ApplicationSeoSubmissionsResponse["data"] {
  const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const data = root.data ?? body;

  let rows: unknown[] = [];
  let metaRaw: unknown = root.meta;

  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.data)) rows = rec.data;
    metaRaw = rec.meta ?? metaRaw;
  }

  return {
    data: rows
      .map(normalizeSubmission)
      .filter((item): item is ApplicationSeoSubmission => item != null),
    meta: normalizeListMeta(metaRaw),
  };
}

export async function getApplicationSeoSubmissions(
  page: number = 1,
): Promise<ApplicationSeoSubmissionsResponse> {
  const response = await api.get<ApplicationSeoSubmissionsResponse>(SUBMISSIONS_PATH, {
    params: { page },
  });
  return {
    status: String((response.data as ApplicationSeoSubmissionsResponse)?.status ?? "true"),
    message: String((response.data as ApplicationSeoSubmissionsResponse)?.message ?? ""),
    data: normalizeSubmissionsListPayload(response.data),
  };
}

export async function deleteApplicationSeoSubmission(id: number): Promise<void> {
  await api.delete(`${SUBMISSIONS_PATH}/${id}`);
}
