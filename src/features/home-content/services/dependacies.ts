import { api } from "@/lib/api";
import type { AccreditationResponse } from "../types";

export const getAccreditations = (): Promise<AccreditationResponse> => {
  return api
    .get<AccreditationResponse>("/v1/admin/accreditations")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateAccreditation = (
  data: FormData,
): Promise<AccreditationResponse> => {
  return api
    .post<AccreditationResponse>(`/v1/admin/accreditations`, data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
