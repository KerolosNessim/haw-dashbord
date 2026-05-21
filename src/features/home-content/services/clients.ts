import { api } from "@/lib/api";
import type { PartnersResponse } from "../types";

export const getClients = (): Promise<PartnersResponse> => {
  return api
    .get<PartnersResponse>("/v1/admin/partners")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateClients = (
   data: FormData,
): Promise<PartnersResponse> => {
  return api
    .post<PartnersResponse>(`/v1/admin/partners`, data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};