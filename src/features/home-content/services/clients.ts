import { api } from "@/lib/api";
import type { AccreditationResponse } from "../types";

export const getClients = (): Promise<AccreditationResponse> => {
  return api
    .get<AccreditationResponse>("/v1/admin/partners")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateClients = (
   data: FormData,
): Promise<AccreditationResponse> => {
  return api
    .post<AccreditationResponse>(`/v1/admin/partners`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};