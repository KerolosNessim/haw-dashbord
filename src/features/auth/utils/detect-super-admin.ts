import type { AdminRole, User } from "../types";

const SUPER_ADMIN_ROLE_SLUGS = new Set([
  "super-admin",
  "super_admin",
  "superadmin",
]);

type SuperAdminProbe = {
  is_super_admin?: boolean | number | string | null;
  permissions?: unknown;
  roles?: unknown;
  /** Some APIs return a single role slug instead of `roles[]`. */
  role?: string | null;
  name?: string | null;
};

function isTruthyFlag(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return false;
}

function isSuperAdminRoleSlug(name: string): boolean {
  return SUPER_ADMIN_ROLE_SLUGS.has(name.trim().toLowerCase());
}

function roleEntryIsSuperAdmin(entry: unknown): boolean {
  if (typeof entry === "string") {
    return isSuperAdminRoleSlug(entry);
  }
  if (!entry || typeof entry !== "object") return false;

  const role = entry as AdminRole & { slug?: string };
  if (role.name && isSuperAdminRoleSlug(role.name)) return true;
  if (role.slug && isSuperAdminRoleSlug(role.slug)) return true;

  const display = role.display_name?.trim().toLowerCase();
  return display === "super admin" || display === "super-admin";
}

function permissionsIncludeWildcard(permissions: unknown): boolean {
  return (
    Array.isArray(permissions) &&
    permissions.some((p) => typeof p === "string" && p.trim() === "*")
  );
}

/**
 * Resolves whether the account should bypass all permission checks.
 * Handles API quirks: Spatie super-admins often return `permissions: []` and
 * `is_super_admin: false` until roles are serialized on login.
 */
export function detectSuperAdmin(data: SuperAdminProbe | User | null | undefined): boolean {
  if (!data || typeof data !== "object") return false;

  if (isTruthyFlag(data.is_super_admin)) return true;
  if (permissionsIncludeWildcard(data.permissions)) return true;

  if (typeof data.role === "string" && isSuperAdminRoleSlug(data.role)) {
    return true;
  }

  if (Array.isArray(data.roles) && data.roles.some(roleEntryIsSuperAdmin)) {
    return true;
  }

  // Broken/partial login payloads: Super Admin user with no roles/permissions yet.
  const permissions = Array.isArray(data.permissions) ? data.permissions : [];
  const roles = Array.isArray(data.roles) ? data.roles : [];
  if (
    permissions.length === 0 &&
    roles.length === 0 &&
    typeof data.name === "string" &&
    /^super\s*admin$/i.test(data.name.trim())
  ) {
    return true;
  }

  return false;
}
