import { api } from "@/lib/api";
import type {
  ServiceAiToolSubmission,
  ServiceAiToolSubmissionResponse,
  ServiceAiToolSubmissionsListMeta,
  ServiceAiToolSubmissionsResponse,
} from "../types/service-ai-tool-submission";

const SUBMISSIONS_PATH = "/v1/admin/service-ai-tool-submissions";

function normalizeSubmission(raw: unknown): ServiceAiToolSubmission | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    challenge: typeof row.challenge === "string" ? row.challenge : "",
    email: typeof row.email === "string" ? row.email : "",
    accepts_updates:
      row.accepts_updates === true ||
      row.accepts_updates === 1 ||
      row.accepts_updates === "1",
    status: typeof row.status === "string" ? row.status : "new",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

function normalizeListMeta(raw: unknown): ServiceAiToolSubmissionsListMeta {
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
): ServiceAiToolSubmissionsResponse["data"] {
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
      .filter((item): item is ServiceAiToolSubmission => item != null),
    meta: normalizeListMeta(metaRaw),
  };
}

export type ServiceAiToolSubmissionsParams = {
  page?: number;
  per_page?: number;
  search?: string;
};

export async function getServiceAiToolSubmissions(
  params: ServiceAiToolSubmissionsParams = {},
): Promise<ServiceAiToolSubmissionsResponse> {
  const response = await api.get<ServiceAiToolSubmissionsResponse>(SUBMISSIONS_PATH, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page,
      search: params.search?.trim() || undefined,
    },
  });
  return {
    status: String((response.data as ServiceAiToolSubmissionsResponse)?.status ?? "true"),
    message: String((response.data as ServiceAiToolSubmissionsResponse)?.message ?? ""),
    data: normalizeSubmissionsListPayload(response.data),
  };
}

export async function getServiceAiToolSubmissionById(
  id: number,
): Promise<ServiceAiToolSubmissionResponse> {
  const response = await api.get<ServiceAiToolSubmissionResponse>(`${SUBMISSIONS_PATH}/${id}`);
  const root = response.data as ServiceAiToolSubmissionResponse;
  const normalized = normalizeSubmission(root.data);
  if (!normalized) throw new Error("Invalid submission response");
  return { ...root, data: normalized };
}

export async function deleteServiceAiToolSubmission(id: number): Promise<void> {
  await api.delete(`${SUBMISSIONS_PATH}/${id}`);
}
