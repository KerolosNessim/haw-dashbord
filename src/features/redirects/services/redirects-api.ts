import { api } from "@/lib/api";
import { assertApiEnvelopeSuccess } from "@/lib/api-payload";
import { normalizeSlugRedirectCodeInput } from "@/lib/http-redirect-codes";
import {
  normalizeInternalSitePath,
  redirectCodeForLocale,
  slugFromInternalPath,
} from "@/lib/locale-path";
import type {
  RedirectFilters,
  RedirectFormValues,
  RedirectLocale,
  RedirectRow,
} from "../types";

const ADMIN_REDIRECTS_BASE = "/v1/admin/redirects";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function unwrapDataArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [];
  const data = root.data;
  if (Array.isArray(data)) return data;
  const nested = asRecord(data);
  if (Array.isArray(nested?.data)) return nested.data;
  if (Array.isArray(nested?.redirects)) return nested.redirects;
  return [];
}

function pickString(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function pickLocale(v: unknown): RedirectLocale {
  return pickString(v).toLowerCase().startsWith("en") ? "en" : "ar";
}

function normalizeRedirectRow(raw: unknown): RedirectRow | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = pickString(row.id);
  if (!id) return null;
  const sourceLocale = pickLocale(row.source_locale ?? row.locale);
  const targetLocale = row.target_locale ? pickLocale(row.target_locale) : null;
  const rawStatus = row.status_code ?? row.status ?? row.code;
  const status =
    redirectCodeForLocale(sourceLocale, normalizeSlugRedirectCodeInput(rawStatus) || rawStatus) ||
    "410";

  const sourcePath = normalizeInternalSitePath(
    pickString(row.source_path ?? row.sourcePath ?? row.old_path ?? row.oldPath),
  );
  const sourceSlug =
    pickString(row.source_slug ?? row.sourceSlug) ||
    slugFromInternalPath(sourcePath) ||
    null;

  const targetPathRaw = pickString(
    row.target_path ?? row.targetPath ?? row.target_url ?? row.to ?? row.to_slug,
  );

  return {
    id,
    source_path: sourcePath || sourceSlug || "",
    source_slug: sourceSlug,
    source_locale: sourceLocale,
    resource_type: pickString(row.resource_type ?? row.resourceType) || "custom",
    resource_id: pickString(row.resource_id ?? row.resourceId) || null,
    status_code: status,
    target_path: targetPathRaw ? normalizeInternalSitePath(targetPathRaw) : null,
    target_locale: targetLocale,
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    created_by: pickString(row.created_by ?? row.createdBy) || null,
    created_at: pickString(row.created_at ?? row.createdAt) || null,
    updated_at: pickString(row.updated_at ?? row.updatedAt) || null,
  };
}

function cleanPayload(values: RedirectFormValues) {
  const sourceLocale = values.source_locale;
  const sourcePath = normalizeInternalSitePath(values.source_path);
  const targetPath = normalizeInternalSitePath(values.target_path ?? "");
  const targetLocale = targetPath ? (values.target_locale ?? sourceLocale) : null;
  const statusCode = redirectCodeForLocale(sourceLocale, values.status_code);

  const payload: Record<string, unknown> = {
    source_path: sourcePath,
    source_slug: slugFromInternalPath(sourcePath),
    source_locale: sourceLocale,
    resource_type: values.resource_type,
    status_code: Number(statusCode),
    is_active: values.is_active,
  };

  const resourceId = values.resource_id?.trim();
  if (resourceId) payload.resource_id = resourceId;

  if (targetPath) {
    payload.target_path = targetPath;
    payload.target_locale = targetLocale;
  }

  return payload;
}

export async function fetchRedirects(filters: RedirectFilters = {}): Promise<RedirectRow[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value != null && String(value).trim() !== ""),
  );
  const res = await api.get<unknown>(ADMIN_REDIRECTS_BASE, { params });
  assertApiEnvelopeSuccess(res.data);
  return unwrapDataArray(res.data)
    .map((row) => normalizeRedirectRow(row))
    .filter((row): row is RedirectRow => row != null);
}

export async function createRedirect(values: RedirectFormValues) {
  const res = await api.post(ADMIN_REDIRECTS_BASE, cleanPayload(values));
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function updateRedirect(id: string, values: RedirectFormValues) {
  const res = await api.put(`${ADMIN_REDIRECTS_BASE}/${encodeURIComponent(id)}`, cleanPayload(values));
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}

export async function deleteRedirect(id: string) {
  const res = await api.delete(`${ADMIN_REDIRECTS_BASE}/${encodeURIComponent(id)}`);
  assertApiEnvelopeSuccess(res.data);
  return res.data;
}
