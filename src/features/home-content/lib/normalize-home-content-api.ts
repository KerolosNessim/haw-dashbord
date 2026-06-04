import axios from "axios";
import type {
  AccreditationData,
  AccreditationResponse,
  HeroData,
  HeroResponse,
  PartnersResponse,
  StatsData,
  StatsResponse,
} from "../types";

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
