import { api } from "@/lib/api"
import type { GetCountriesResponse } from "../types";
import i18n from "@/i18n"


export const getCountriesApi = (): Promise<GetCountriesResponse> => {
  return api.get("/v1/countries", {
    headers: {
      "Accept-Language": i18n.language ?? "ar",
    },
  })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};