import { api } from "@/lib/api";
import type { AccreditationResponse } from "../types";
import { appendCountryIdToFormData, countryIdQuery } from "../lib/country-scope";
import {
  emptyAccreditationResponse,
  handleHomeContentGetError,
  normalizeAccreditationData,
} from "../lib/normalize-home-content-api";

export const getAccreditations = (countryId: number): Promise<AccreditationResponse> => {
  return api
    .get<AccreditationResponse>("/v1/admin/accreditations", {
      params: countryIdQuery(countryId),
    })
    .then((res) => ({
      ...res.data,
      data: normalizeAccreditationData(res.data.data, countryId),
    }))
    .catch((error) =>
      handleHomeContentGetError(countryId, emptyAccreditationResponse, error),
    );
};

export const updateAccreditation = (
  countryId: number,
  data: FormData,
): Promise<AccreditationResponse> => {
  appendCountryIdToFormData(data, countryId);
  return api
    .post<AccreditationResponse>(`/v1/admin/accreditations`, data, {
      params: countryIdQuery(countryId),
    })
    .then((res) => ({
      ...res.data,
      data: normalizeAccreditationData(res.data.data, countryId),
    }));
};
