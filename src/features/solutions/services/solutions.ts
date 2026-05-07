import { api } from "@/lib/api";
import type { SolutionItemsResponse, SolutionsResponse } from "../types";

export const getSolutions = (): Promise<SolutionsResponse> => {
  return api
    .get<SolutionsResponse>("/v1/admin/solutions")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const getSolutionItems = (): Promise<SolutionItemsResponse> => {
  return api
    .get<SolutionItemsResponse>("/v1/admin/solutions/singles")
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateSolutions = (data: FormData): Promise<SolutionsResponse> => {
  return api
    .post<SolutionsResponse>("/v1/admin/solutions", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

export const updateSolutionItems = (data: FormData): Promise<SolutionsResponse> => {
  return api
    .post<SolutionsResponse>("/v1/admin/solutions/singles/bulk-sync", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};
