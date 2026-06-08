import { api } from "@/lib/api";
import type { PartnersResponse } from "../types";
import { appendCountryIdToFormData, countryIdQuery } from "../lib/country-scope";
import {
  emptyPartnersResponse,
  handleHomeContentGetError,
  normalizeAccreditationData,
} from "../lib/normalize-home-content-api";

function normalizePartnersResponse(body: PartnersResponse, countryId: number): PartnersResponse {
  const rows = Array.isArray(body.data?.data) ? body.data.data : [];
  return {
    ...body,
    data: {
      data: rows.map((row) => normalizeAccreditationData(row, countryId)),
    },
  };
}

export const getClients = (countryId: number): Promise<PartnersResponse> => {
  return api
    .get<PartnersResponse>("/v1/admin/partners", { params: countryIdQuery(countryId) })
    .then((res) => normalizePartnersResponse(res.data, countryId))
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
    .then((res) => normalizePartnersResponse(res.data, countryId));
};
