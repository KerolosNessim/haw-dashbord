import type { AdminRole } from "@/features/auth/types";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_super_admin?: boolean;
  roles: AdminRole[];
  permissions?: string[];
  last_login_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminUsersListResponse {
  status: string;
  message: string;
  data: {
    users: AdminUser[];
    meta: ApiListMeta;
  };
}

export interface AdminUserResponse {
  status: string;
  message: string;
  data: { user: AdminUser };
}

export type AdminUserFormValues = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role_ids: number[];
  is_active: boolean;
};
