export interface AdminRole {
  id: number;
  name: string;
  display_name: string;
}

/** Logged-in dashboard staff (persisted in auth store). */
export interface User {
  id: number;
  name: string;
  email: string;
  is_active?: boolean;
  is_super_admin?: boolean;
  roles?: AdminRole[];
  permissions?: string[];
  /** Present only in login payload — never persisted. */
  token?: string;
}

export type LoginData = User & {
  accessToken?: string;
  token?: string;
  /** Some login payloads expose a single role slug. */
  role?: string;
};

export interface LoginResponse {
  status: string;
  message: string;
  data: LoginData | null;
}

export interface MeResponse {
  status: string;
  message: string;
  data: Omit<User, "token"> | null;
}
