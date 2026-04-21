import { api } from "@/lib/api"
import type { GetServicesResponse } from "../type";
import i18n from "@/i18n"


export const getServicesApi = (): Promise<GetServicesResponse> => {
  return api.get("/v1/services", {
    headers: {
      "Accept-Language": i18n.language ?? "ar",
    },
  })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};