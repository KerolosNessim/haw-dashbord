import type { GetCountriesResponse } from "@/features/countries/types";
import { api } from "@/lib/api";

import i18n from "@/i18n";

// Public / used for selects (might still be on /v1/countries or redirected)
export const getCountriesApi = (): Promise<GetCountriesResponse> => {
  return api.get("/v1/countries", {
    headers: {
      "Accept-Language": i18n.language ?? "ar",
    },
  })
    .then((res) => res.data);
};

// Admin Management
export const getAdminCountriesApi = (): Promise<GetCountriesResponse> => {
  return api.get("/v1/admin/countries")
    .then((res) => res.data);
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
