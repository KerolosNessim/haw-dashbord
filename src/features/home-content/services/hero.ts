import { api } from "@/lib/api";
import type { HeroResponse } from "../types";
import { appendCountryIdToFormData, countryIdQuery } from "../lib/country-scope";
import {
  emptyHeroResponse,
  handleHomeContentGetError,
} from "../lib/normalize-home-content-api";

export const getHeroContent = (countryId: number): Promise<HeroResponse> => {
  return api
    .get<HeroResponse>("/v1/admin/hero", { params: countryIdQuery(countryId) })
    .then((res) => res.data)
    .catch((error) => handleHomeContentGetError(countryId, emptyHeroResponse, error));
};

export const updateHeroContent = (
  countryId: number,
  data: FormData | Record<string, unknown>,
): Promise<HeroResponse> => {
  let payload: FormData | Record<string, unknown>;
  if (data instanceof FormData) {
    appendCountryIdToFormData(data, countryId);
    payload = data;
  } else {
    payload = { ...data, country_id: countryId };
  }

  return api
    .post<HeroResponse>("/v1/admin/hero", payload, {
      params: countryIdQuery(countryId),
    })
    .then((res) => res.data);
};
