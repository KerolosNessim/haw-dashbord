import { api } from "@/lib/api";
import type {
  AdminUserFormValues,
  AdminUserResponse,
  AdminUsersListResponse,
} from "../types";

export async function fetchAdminUsers(
  page = 1,
  search = "",
): Promise<AdminUsersListResponse> {
  const res = await api.get<AdminUsersListResponse>("/v1/admin/admin-users", {
    params: { page, search: search || undefined },
  });
  return res.data;
}

export async function createAdminUser(
  body: AdminUserFormValues,
): Promise<AdminUserResponse> {
  const res = await api.post<AdminUserResponse>("/v1/admin/admin-users", body);
  return res.data;
}

export async function updateAdminUser(
  id: number,
  body: Partial<AdminUserFormValues>,
): Promise<AdminUserResponse> {
  const res = await api.put<AdminUserResponse>(`/v1/admin/admin-users/${id}`, body);
  return res.data;
}

export async function deleteAdminUser(id: number): Promise<AdminUserResponse> {
  const res = await api.delete<AdminUserResponse>(`/v1/admin/admin-users/${id}`);
  return res.data;
}
