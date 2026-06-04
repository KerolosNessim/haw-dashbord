import { api } from "@/lib/api";
import type { StatsData, StatsResponse } from "../types";
import { countryIdQuery } from "../lib/country-scope";
import {
  handleHomeContentGetError,
  parseAdminStatsList,
} from "../lib/normalize-home-content-api";

export const getStatsApi = (countryId: number): Promise<StatsResponse> => {
  return api
    .get<StatsResponse>("/v1/admin/hero-stats", { params: countryIdQuery(countryId) })
    .then((res) => res.data)
    .catch((error) =>
      handleHomeContentGetError(
        countryId,
        () => ({ status: "true", message: "", data: [] }),
        error,
      ),
    );
};

export interface UpdateStatItem {
  id?: number;
  title: { ar: string; en: string };
  number: string;
  description: { ar: string; en: string };
}

export type UpdateStatPayload = UpdateStatItem[];

export const updateStatApi = (
  countryId: number,
  data: UpdateStatPayload,
): Promise<{ status: string; message: string; data: StatsData[] }> => {
  return api
    .post(`/v1/admin/hero-stats/bulk-sync`, data, {
      params: countryIdQuery(countryId),
    })
    .then((res) => {
      const body = res.data as StatsResponse;
      return {
        status: body.status,
        message: body.message,
        data: parseAdminStatsList(body),
      };
    });
};

export { parseAdminStatsList };
