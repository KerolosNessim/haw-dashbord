import { api } from "@/lib/api";
import { normalizeSlugRedirectCodeInput } from "@/lib/http-redirect-codes";
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
  const status = normalizeSlugRedirectCodeInput(row.status_code ?? row.status ?? row.code);
  return {
    id,
    source_path: pickString(row.source_path ?? row.sourcePath ?? row.old_path ?? row.oldPath),
    source_slug: pickString(row.source_slug ?? row.sourceSlug) || null,
    source_locale: pickLocale(row.source_locale ?? row.locale),
    resource_type: pickString(row.resource_type ?? row.resourceType) || "custom",
    resource_id: pickString(row.resource_id ?? row.resourceId) || null,
    status_code: status || "410",
    target_path: pickString(row.target_path ?? row.targetPath ?? row.target_url ?? row.to ?? row.to_slug) || null,
    target_locale: row.target_locale ? pickLocale(row.target_locale) : null,
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    created_by: pickString(row.created_by ?? row.createdBy) || null,
    created_at: pickString(row.created_at ?? row.createdAt) || null,
    updated_at: pickString(row.updated_at ?? row.updatedAt) || null,
  };
}

function cleanPayload(values: RedirectFormValues) {
  const target = values.target_path?.trim();
  return {
    source_path: values.source_path.trim(),
    source_locale: values.source_locale,
    resource_type: values.resource_type,
    resource_id: values.resource_id?.trim() || null,
    status_code: values.status_code,
    target_path: target || null,
    target_locale: target ? values.target_locale ?? values.source_locale : null,
    is_active: values.is_active ? 1 : 0,
  };
}

export async function fetchRedirects(filters: RedirectFilters = {}): Promise<RedirectRow[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value != null && String(value).trim() !== ""),
  );
  const res = await api.get<unknown>(ADMIN_REDIRECTS_BASE, { params });
  return unwrapDataArray(res.data)
    .map((row) => normalizeRedirectRow(row))
    .filter((row): row is RedirectRow => row != null);
}

export async function createRedirect(values: RedirectFormValues) {
  const res = await api.post(ADMIN_REDIRECTS_BASE, cleanPayload(values));
  return res.data;
}

export async function updateRedirect(id: string, values: RedirectFormValues) {
  const res = await api.put(`${ADMIN_REDIRECTS_BASE}/${encodeURIComponent(id)}`, cleanPayload(values));
  return res.data;
}

export async function deleteRedirect(id: string) {
  const res = await api.delete(`${ADMIN_REDIRECTS_BASE}/${encodeURIComponent(id)}`);
  return res.data;
}
