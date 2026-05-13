import { api } from "@/lib/api"
import type { GetServicesApiRaw, GetServicesResponse } from "../type";
import i18n from "@/i18n"


export const getServicesApi = (): Promise<GetServicesResponse> => {
  return api.get<GetServicesApiRaw>("/v1/services", {
    headers: {
      "Accept-Language": i18n.language ?? "ar",
    },
  })
    .then((res) => ({
      status: res.data.status,
      message: res.data.message,
      data: {
        data: Array.isArray(res.data.data) ? res.data.data : res.data.data?.data ?? [],
        meta: Array.isArray(res.data.data) ? undefined : res.data.data?.meta,
      },
      meta: Array.isArray(res.data.data) ? undefined : res.data.data?.meta,
    }))
    .catch((error) => {
      throw error;
    });
};