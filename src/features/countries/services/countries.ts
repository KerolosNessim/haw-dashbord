import type { Country, GetCountriesResponse } from "@/features/countries/types";
import { api } from "@/lib/api";

import i18n from "@/i18n";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapCountriesArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  if (!root) return [];

  const direct = root.data ?? root.countries ?? root.items ?? root.results;
  if (Array.isArray(direct)) return direct;

  const nested = asRecord(direct);
  if (!nested) return [];

  const nestedRows = nested.data ?? nested.countries ?? nested.items ?? nested.results;
  return Array.isArray(nestedRows) ? nestedRows : [];
}

function pickLocalized(field: unknown, lang: "ar" | "en"): string {
  if (typeof field === "string") return field;
  const record = asRecord(field);
  const value = record?.[lang];
  return typeof value === "string" ? value : "";
}

function normalizeCountry(raw: unknown): Country | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = Number(record.id ?? record.country_id);
  if (!Number.isFinite(id)) return null;

  const nameSource = record.name ?? record.title;
  const image =
    record.image ??
    record.image_url ??
    record.flag ??
    record.flag_url ??
    "";
  const active = record.is_active ?? record.isActive ?? record.status;

  return {
    id,
    name: {
      ar: pickLocalized(nameSource, "ar") || String(record.name_ar ?? ""),
      en: pickLocalized(nameSource, "en") || String(record.name_en ?? ""),
    },
    image: typeof image === "string" ? image : "",
    is_active: !(active === false || active === 0 || active === "0" || active === "inactive"),
  };
}

function normalizeCountriesResponse(payload: unknown): GetCountriesResponse {
  const root = asRecord(payload);
  return {
    status: String(root?.status ?? "true"),
    message: typeof root?.message === "string" ? root.message : "",
    data: unwrapCountriesArray(payload)
      .map(normalizeCountry)
      .filter((country): country is Country => country != null),
  };
}

// Public / used for selects (might still be on /v1/countries or redirected)
export const getCountriesApi = (): Promise<GetCountriesResponse> => {
  return api.get("/v1/countries", {
    headers: {
      "Accept-Language": i18n.language ?? "ar",
    },
  })
    .then((res) => normalizeCountriesResponse(res.data));
};

// Admin Management
export const getAdminCountriesApi = (): Promise<GetCountriesResponse> => {
  return api.get("/v1/admin/countries")
    .then((res) => normalizeCountriesResponse(res.data));
};

export const saveCountryApi = (data: FormData): Promise<unknown> => {
  return api.post("/v1/admin/countries", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((res) =>{
      return res.data});
};

export const deleteCountryApi = (id: number): Promise<unknown> => {
  return api.delete(`/v1/admin/countries/${id}`)
    .then((res) => res.data);
};
