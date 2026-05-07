import { api } from "@/lib/api";
import type { StatsData, StatsResponse } from "../types";

export const getStatsApi = (): Promise<StatsResponse> => {
  return api
    .get<StatsResponse>("v1/hero-stats")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export interface UpdateStatItem {
  title: { ar: string; en: string };
  number: string;
  description: { ar: string; en: string };
}

export type UpdateStatPayload = UpdateStatItem[];

export const updateStatApi = (
  data: UpdateStatPayload,
): Promise<{ status: string; message: string; data: StatsData[] }> => {
  return api
    .post(`/v1/admin/hero-stats/bulk-sync`, data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
