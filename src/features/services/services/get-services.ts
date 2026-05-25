import { api } from "@/lib/api"
import type { GetServicesApiRaw, GetServicesResponse, Service } from "../type";
import { normalizeService } from "../utils/service-mapper";
import i18n from "@/i18n"


export const getServicesApi = (): Promise<GetServicesResponse> => {
  return api.get<GetServicesApiRaw>("/v1/services", {
    headers: {
      "Accept-Language": i18n.language ?? "ar",
    },
  })
    .then((res) => {
      const rawList = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.data?.data ?? [];
      const meta = Array.isArray(res.data.data) ? undefined : res.data.data?.meta;

      return {
        status: res.data.status,
        message: res.data.message,
        data: {
          data: rawList.map((item) =>
            normalizeService(item as Record<string, unknown>),
          ),
          meta,
        },
        meta,
      };
    })
    .catch((error) => {
      throw error;
    });
};

export const getPublicServiceByIdApi = (id: number | string): Promise<Service> => {
  return api
    .get<GetServicesApiRaw>(`/v1/services/${id}`, {
      headers: {
        "Accept-Language": i18n.language ?? "ar",
      },
    })
    .then((res) => {
      const payload = res.data.data;
      const record = Array.isArray(payload)
        ? (payload[0] as Record<string, unknown> | undefined)
        : (payload as Record<string, unknown> | undefined);
      if (!record || typeof record !== "object") {
        throw new Error("Service not found");
      }
      return normalizeService(record);
    });
};