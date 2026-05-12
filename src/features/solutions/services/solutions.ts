import { api } from "@/lib/api";
import type { SolutionsResponse } from "../types";

export const getSolutions = (): Promise<SolutionsResponse> => {
  return api
    .get<SolutionsResponse>("/v1/admin/solutions")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateSolutions = (data: FormData): Promise<SolutionsResponse> => {
  return api
    .post<SolutionsResponse>("/v1/admin/solutions", data)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
