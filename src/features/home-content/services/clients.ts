import { api } from "@/lib/api";
import type { PartnersResponse } from "../types";
import { appendCountryIdToFormData, countryIdQuery } from "../lib/country-scope";
import {
  emptyPartnersResponse,
  handleHomeContentGetError,
} from "../lib/normalize-home-content-api";

export const getClients = (countryId: number): Promise<PartnersResponse> => {
  return api
    .get<PartnersResponse>("/v1/admin/partners", { params: countryIdQuery(countryId) })
    .then((res) => res.data)
    .catch((error) => handleHomeContentGetError(countryId, emptyPartnersResponse, error));
};

export const updateClients = (
  countryId: number,
  data: FormData,
): Promise<PartnersResponse> => {
  appendCountryIdToFormData(data, countryId);
  return api
    .post<PartnersResponse>(`/v1/admin/partners`, data, {
      params: countryIdQuery(countryId),
    })
    .then((res) => res.data);
};
