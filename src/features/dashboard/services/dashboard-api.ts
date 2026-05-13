import { api } from "@/lib/api"
import type { DashboardStatsResponse } from "../types"

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await api.get<DashboardStatsResponse>("/v1/admin/dashboard/stats")
  return response.data
}
