import axios from "axios";
import type {
  AccreditationData,
  AccreditationImageAlt,
  AccreditationLinkedService,
  AccreditationMedia,
  AccreditationResponse,
  HeroData,
  HeroResponse,
  LocaleString,
  PartnersResponse,
  StatsData,
  StatsResponse,
} from "../types";

function pickLocalized(field: unknown): LocaleString {
  if (typeof field === "string") return { ar: field, en: field };
  if (!field || typeof field !== "object" || Array.isArray(field)) return { ar: "", en: "" };
  const row = field as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : "",
    en: typeof row.en === "string" ? row.en : "",
  };
}

function pickImageAlt(field: unknown): AccreditationImageAlt {
  if (!field || typeof field !== "object" || Array.isArray(field)) {
    return { ar: null, en: null };
  }
  const row = field as { ar?: unknown; en?: unknown };
  return {
    ar: typeof row.ar === "string" ? row.ar : null,
    en: typeof row.en === "string" ? row.en : null,
  };
}

function pickLinkedServices(raw: unknown): AccreditationLinkedService[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = Number(row.id);
      if (!Number.isFinite(id) || id <= 0) return null;
      return { id, title: pickLocalized(row.title) };
    })
    .filter((item): item is AccreditationLinkedService => item != null);
}

export function normalizeAccreditationMedia(raw: unknown): AccreditationMedia {
  const row = (raw ?? {}) as Record<string, unknown>;
  const services = pickLinkedServices(row.services);
  const serviceIdsFromApi = Array.isArray(row.service_ids)
    ? row.service_ids.map((id) => Number(id)).filter((id) => id > 0)
    : [];
  return {
    id: Number(row.id ?? 0),
    url: typeof row.url === "string" ? row.url : "",
    image_alt: pickImageAlt(row.image_alt),
    service_ids: serviceIdsFromApi.length > 0 ? serviceIdsFromApi : services.map((s) => s.id),
    services,
  };
}

export function normalizeAccreditationData(raw: unknown, countryId?: number): AccreditationData {
  const row = (raw ?? {}) as Record<string, unknown>;
  const imagesRaw = Array.isArray(row.images) ? row.images : [];
  return {
    id: Number(row.id ?? 0),
    title: pickLocalized(row.title),
    description: pickLocalized(row.description),
    images: imagesRaw.map(normalizeAccreditationMedia),
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
    country_id:
      countryId ??
      (row.country_id == null || row.country_id === "" ? null : Number(row.country_id)),
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export function isAxiosNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function emptyHeroData(countryId: number): HeroData {
  return {
    id: 0,
    slug: "hero",
    is_active: true,
    phone: "",
    country_id: countryId,
    content: {
      title: { ar: "", en: "" },
      description: { ar: "", en: "" },
      sub_description: { ar: "", en: "" },
      image: null,
    },
  };
}

export function emptyHeroResponse(countryId: number): HeroResponse {
  return {
    status: "true",
    message: "",
    data: emptyHeroData(countryId),
  };
}

export function parseAdminStatsList(
  response: StatsResponse | undefined,
): StatsData[] {
  const raw = response?.data;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: StatsData[] }).data;
  }
  return [];
}

export function emptyAccreditationData(countryId: number): AccreditationData {
  return {
    id: 0,
    title: { ar: "", en: "" },
    description: { ar: "", en: "" },
    images: [],
    sort_order: 0,
    is_active: true,
    country_id: countryId,
    created_at: "",
  };
}

export function emptyAccreditationResponse(countryId: number): AccreditationResponse {
  return {
    status: "true",
    message: "",
    data: emptyAccreditationData(countryId),
  };
}

export function emptyPartnersResponse(): PartnersResponse {
  return {
    status: "true",
    message: "",
    data: { data: [] },
  };
}

export function handleHomeContentGetError<T>(
  countryId: number,
  empty: (countryId: number) => T,
  error: unknown,
): T {
  if (isAxiosNotFound(error)) return empty(countryId);
  throw error;
}
