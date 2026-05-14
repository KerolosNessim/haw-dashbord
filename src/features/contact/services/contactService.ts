import { api } from "@/lib/api";
import type { ContactSubmissionsResponse } from "../types/index";

export const getContactSubmissions = async (page: number = 1): Promise<ContactSubmissionsResponse> => {
  const response = await api.get<ContactSubmissionsResponse>("/v1/admin/contact/submissions", {
    params: { page },
  });
  return response.data;
};
