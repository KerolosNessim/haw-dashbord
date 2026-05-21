import type { GetServiceResponse } from "../type";
import type { BasicInfoValues } from "../components/builder/basic-info-form";
import type { ServiceSectionsPayload } from "../service-section-types";
import { buildServicePageFormData } from "./service-form-data";
import { api } from "@/lib/api";

/**
 * Single request create/update for service + all sections (page builder).
 * POST /v1/admin/services or POST /v1/admin/services/{id} with _method=PUT
 */
export async function saveServicePageApi(
  basic: BasicInfoValues,
  sections: ServiceSectionsPayload,
  serviceId?: number,
): Promise<GetServiceResponse> {
  const formData = buildServicePageFormData(basic, sections);
  const url = serviceId
    ? `/v1/admin/services/${serviceId}`
    : "/v1/admin/services";

  if (serviceId) {
    formData.append("_method", "PUT");
  }

  return api.post(url, formData).then((res) => res.data);
}

/** @deprecated Use saveServicePageApi — kept for gradual migration */
export const basicFormApi = (
  values: BasicInfoValues,
  id?: number,
  sections: ServiceSectionsPayload = {},
) => saveServicePageApi(values, sections, id);
