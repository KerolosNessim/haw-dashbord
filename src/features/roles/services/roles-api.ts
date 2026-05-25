import { api } from "@/lib/api";
import type {
  PermissionsRegistryResponse,
  RoleFormValues,
  RoleResponse,
  RolesListResponse,
} from "../types";

export async function fetchRoles(page = 1, search = ""): Promise<RolesListResponse> {
  const res = await api.get<RolesListResponse>("/v1/admin/roles", {
    params: { page, search: search || undefined },
  });
  return res.data;
}

export async function fetchRole(id: number): Promise<RoleResponse> {
  const res = await api.get<RoleResponse>(`/v1/admin/roles/${id}`);
  return res.data;
}

export async function fetchPermissionsRegistry(): Promise<PermissionsRegistryResponse> {
  const res = await api.get<PermissionsRegistryResponse>("/v1/admin/permissions");
  return res.data;
}

export async function createRole(body: RoleFormValues): Promise<RoleResponse> {
  const res = await api.post<RoleResponse>("/v1/admin/roles", body);
  return res.data;
}

export async function updateRole(
  id: number,
  body: RoleFormValues,
): Promise<RoleResponse> {
  const res = await api.put<RoleResponse>(`/v1/admin/roles/${id}`, body);
  return res.data;
}

export async function deleteRole(id: number): Promise<RoleResponse> {
  const res = await api.delete<RoleResponse>(`/v1/admin/roles/${id}`);
  return res.data;
}
