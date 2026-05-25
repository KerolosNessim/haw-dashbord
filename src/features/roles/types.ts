export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[];
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionItem {
  name: string;
  label: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: PermissionItem[];
}

export interface ApiListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface RolesListResponse {
  status: string;
  message: string;
  data: {
    roles: Role[];
    meta: ApiListMeta;
  };
}

export interface RoleResponse {
  status: string;
  message: string;
  data: { role: Role };
}

export interface PermissionsRegistryResponse {
  status: string;
  message: string;
  data: { groups: PermissionGroup[] };
}

export type RoleFormValues = {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
};
