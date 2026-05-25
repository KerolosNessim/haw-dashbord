import type { LoginData, User } from "../types";
import { detectSuperAdmin } from "./detect-super-admin";

type AuthPayload = LoginData | User | null | undefined;

/** Strips tokens and normalizes roles/permissions for the auth store. */
export function normalizeAuthUser(data: AuthPayload): User | null {
  if (!data || typeof data !== "object") return null;

  const { accessToken: _a, token: _t, ...rest } = data as LoginData;
  const isSuperAdmin = detectSuperAdmin(rest);

  return {
    id: rest.id,
    name: rest.name,
    email: rest.email,
    is_active: rest.is_active ?? true,
    is_super_admin: isSuperAdmin,
    roles: Array.isArray(rest.roles) ? rest.roles : [],
    permissions: normalizePermissions(rest.permissions, isSuperAdmin),
  };
}

function normalizePermissions(
  permissions: unknown,
  isSuperAdmin: boolean,
): string[] {
  if (isSuperAdmin) return ["*"];
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p): p is string => typeof p === "string");
}
