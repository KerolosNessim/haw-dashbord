import { api } from "@/lib/api";
import { normalizeService } from "../utils/service-mapper";
import type { GetServiceResponse, GetServicesResponse } from "../type";

export const getAdminServicesApi = (): Promise<GetServicesResponse> => {
  return api.get<GetServicesResponse>("/v1/admin/services").then((res) => {
    const payload = res.data.data;
    const rawList = Array.isArray(payload) ? payload : payload?.data ?? [];
    const meta = Array.isArray(payload) ? undefined : payload?.meta;

    return {
      ...res.data,
      data: {
        data: rawList.map((item) =>
          normalizeService(item as unknown as Record<string, unknown>),
        ),
        meta,
      },
    };
  });
};

export const getAdminServiceByIdApi = (id: number | string): Promise<GetServiceResponse> => {
  return api.get<GetServiceResponse>(`/v1/admin/services/${id}`).then((res) => ({
    ...res.data,
    data: normalizeService(res.data.data as unknown as Record<string, unknown>),
  }));
};

export const deleteAdminServiceApi = (id: number | string) => {
  return api.delete(`/v1/admin/services/${id}`)
    .then((res) => res.data);
};
