import type { DeleteSlugRedirectPayload } from "@/lib/delete-slug-redirect";
import { api } from "@/lib/api";
import {
  assertApiEnvelopeSuccess,
  unwrapDataArray,
  unwrapShowResource,
} from "@/lib/api-payload";
import { normalizeService } from "../utils/service-mapper";
import type { GetServiceResponse, GetServicesResponse } from "../type";
import { getAdminServicesBasePath } from "./service-resource-config";

export const getAdminServicesApi = (): Promise<GetServicesResponse> => {
  return api.get<GetServicesResponse>(getAdminServicesBasePath()).then((res) => {
    assertApiEnvelopeSuccess(res.data);
    const rawList = unwrapDataArray(res.data.data ?? res.data);
    const payload = res.data.data;
    const meta =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as { meta?: GetServicesResponse["data"]["meta"] }).meta
        : undefined;

    return {
      ...res.data,
      data: {
        data: rawList.map((item) => normalizeService(item)),
        meta,
      },
    };
  });
};

export const getAdminServiceByIdApi = (id: number | string): Promise<GetServiceResponse> => {
  return api.get<GetServiceResponse>(`${getAdminServicesBasePath()}/${id}`).then((res) => {
    assertApiEnvelopeSuccess(res.data);
    const record = unwrapShowResource(res.data);
    return {
      ...res.data,
      data: normalizeService(record),
    };
  });
};

export const deleteAdminServiceApi = (
  id: number | string,
  payload: DeleteSlugRedirectPayload,
) => {
  return api
    .delete(`${getAdminServicesBasePath()}/${id}`, { data: payload })
    .then((res) => res.data);
};
