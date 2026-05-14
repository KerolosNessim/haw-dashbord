import { api } from "@/lib/api";
import type { UsersResponse } from "../types/index";

export const getUsers = async (page: number = 1): Promise<UsersResponse> => {
  const response = await api.get<UsersResponse>("/v1/admin/users", {
    params: { page },
  });
  return response.data;
};
