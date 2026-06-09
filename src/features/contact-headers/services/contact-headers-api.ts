import { api } from "@/lib/api";
import { countryIdsQuery } from "@/features/home-content/lib/country-scope";
import type {
  ContactHeader,
  ContactHeaderApiResponse,
  ContactHeaderCountry,
  ContactHeaderFormValues,
  LocalizedString,
} from "../types";

const BASE_PATH = "/v1/admin/contact/headers";

function localeString(raw: unknown): LocalizedString {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ar: "", en: "" };
  }
  const row = raw as { ar?: unknown; en?: unknown };
  return {
    ar: row.ar != null ? String(row.ar) : "",
    en: row.en != null ? String(row.en) : "",
  };
}

function normalizeCountry(raw: unknown): ContactHeaderCountry {
  if (!raw || typeof raw !== "object") {
    return { id: 0, name: { ar: "", en: "" } };
  }
  const row = raw as Record<string, unknown>;
  return {
    id: Number(row.id) || 0,
    name: localeString(row.name),
  };
}

export function normalizeContactHeader(raw: unknown): ContactHeader | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const countryIdsRaw = row.country_ids ?? row.countryIds;
  let country_ids: number[] = [];
  if (Array.isArray(countryIdsRaw)) {
    country_ids = countryIdsRaw
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
  } else if (row.country_id != null) {
    const single = Number(row.country_id);
    if (Number.isFinite(single) && single > 0) country_ids = [single];
  }

  const countriesRaw = row.countries;
  const countries = Array.isArray(countriesRaw)
    ? countriesRaw.map(normalizeCountry).filter((c) => c.id > 0)
    : undefined;

  return {
    id,
    title: localeString(row.title),
    description: localeString(row.description),
    meta_title: localeString(row.meta_title),
    meta_description: localeString(row.meta_description),
    sort_order: Number(row.sort_order ?? 0) || 0,
    is_active: row.is_active === true || row.is_active === 1 || row.is_active === "1",
    country_ids,
    country_id:
      row.country_id != null && Number.isFinite(Number(row.country_id))
        ? Number(row.country_id)
        : null,
    countries,
  };
}

function normalizeListPayload(body: unknown): ContactHeader[] {
  const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const data = root.data ?? body;
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map(normalizeContactHeader)
    .filter((item): item is ContactHeader => item != null)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export function emptyContactHeaderFormValues(): ContactHeaderFormValues {
  return {
    country_ids: [],
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    meta_title: { ar: "", en: "" },
    meta_description: { ar: "", en: "" },
    sort_order: 0,
    is_active: true,
  };
}

export function headerToFormValues(header: ContactHeader): ContactHeaderFormValues {
  return {
    country_ids: header.country_ids.map(String),
    title: { ...header.title },
    description: { ...header.description },
    meta_title: { ...header.meta_title },
    meta_description: { ...header.meta_description },
    sort_order: header.sort_order,
    is_active: header.is_active,
  };
}

function localizedPayload(value: LocalizedString | undefined | null): LocalizedString {
  return {
    ar: (value?.ar ?? "").trim(),
    en: (value?.en ?? "").trim(),
  };
}

function buildPayload(values: ContactHeaderFormValues, mode: "create" | "update") {
  const country_ids = values.country_ids
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);

  const title = localizedPayload(values.title);
  const description = localizedPayload(values.description);
  const meta_title = localizedPayload(values.meta_title);
  const meta_description = localizedPayload(values.meta_description);

  const payload: Record<string, unknown> = {
    title,
    description,
    meta_title,
    meta_description,
    sort_order: Number.isFinite(values.sort_order) ? values.sort_order : 0,
    is_active: values.is_active !== false,
    country_ids,
  };

  if (mode === "update" && country_ids.length === 0) {
    delete payload.country_ids;
  }

  return payload;
}

export async function fetchContactHeaders(
  countryIds?: number[],
): Promise<ContactHeader[]> {
  const response = await api.get<ContactHeaderApiResponse<unknown>>(BASE_PATH, {
    params: countryIdsQuery(countryIds),
  });
  return normalizeListPayload(response.data);
}

export async function fetchContactHeaderById(id: number): Promise<ContactHeader> {
  const response = await api.get<ContactHeaderApiResponse<unknown>>(`${BASE_PATH}/${id}`);
  const root = response.data as ContactHeaderApiResponse<unknown>;
  const normalized = normalizeContactHeader(root.data);
  if (!normalized) throw new Error("Invalid contact header response");
  return normalized;
}

export async function createContactHeader(
  values: ContactHeaderFormValues,
): Promise<ContactHeaderApiResponse<ContactHeader>> {
  const response = await api.post<ContactHeaderApiResponse<unknown>>(
    BASE_PATH,
    buildPayload(values, "create"),
  );
  const root = response.data as ContactHeaderApiResponse<unknown>;
  const normalized = normalizeContactHeader(root.data);
  return {
    status: String(root.status ?? "true"),
    message: String(root.message ?? ""),
    data: normalized ?? ({} as ContactHeader),
  };
}

export async function updateContactHeader(
  id: number,
  values: ContactHeaderFormValues,
): Promise<ContactHeaderApiResponse<ContactHeader>> {
  const response = await api.put<ContactHeaderApiResponse<unknown>>(
    `${BASE_PATH}/${id}`,
    buildPayload(values, "update"),
  );
  const root = response.data as ContactHeaderApiResponse<unknown>;
  const normalized = normalizeContactHeader(root.data);
  return {
    status: String(root.status ?? "true"),
    message: String(root.message ?? ""),
    data: normalized ?? ({} as ContactHeader),
  };
}

export async function deleteContactHeader(id: number): Promise<void> {
  await api.delete(`${BASE_PATH}/${id}`);
}
