import type { User } from "@/features/auth/types";
import { detectSuperAdmin } from "@/features/auth/utils/detect-super-admin";

export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return detectSuperAdmin(user);
}

export function can(user: User | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return user.permissions?.includes(permission) ?? false;
}

export function canAny(
  user: User | null | undefined,
  permissions: readonly string[],
): boolean {
  return permissions.some((p) => can(user, p));
}

export function canAll(
  user: User | null | undefined,
  permissions: readonly string[],
): boolean {
  return permissions.every((p) => can(user, p));
}
