import { api } from "@/lib/api";
import { assertApiEnvelopeSuccess, unwrapDataArray } from "@/lib/api-payload";
import { normalizeService } from "@/features/services/utils/service-mapper";
import type { Service } from "@/features/services/type";

const REGULAR_SERVICES_PATH = "/v1/admin/services";

/** Admin list of regular services only (excludes Service AI). */
export async function fetchRegularAdminServices(): Promise<Service[]> {
  const res = await api.get(REGULAR_SERVICES_PATH);
  assertApiEnvelopeSuccess(res.data);
  const rawList = unwrapDataArray(res.data.data ?? res.data);
  return rawList.map((item) => normalizeService(item));
}
