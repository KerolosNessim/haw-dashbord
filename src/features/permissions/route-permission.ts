import type { User } from "@/features/auth/types";
import { can } from "./can";
import { PERMISSION_BY_ROUTE } from "./constants";
import { resourceFromPathname } from "./path-to-resource";

/** Resolves the permission required for a pathname (view, create, or update). */
export function getRoutePermission(pathname: string): string | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized.endsWith("/create")) {
    const base = normalized.replace(/\/create$/, "");
    const resource = resourceFromPathname(base);
    return resource ? `${resource}.create` : undefined;
  }

  if (/\/edit\/[^/]+$/.test(normalized)) {
    const base = normalized.replace(/\/edit\/[^/]+$/, "");
    const resource = resourceFromPathname(base);
    return resource ? `${resource}.update` : undefined;
  }

  if (PERMISSION_BY_ROUTE[normalized]) {
    return PERMISSION_BY_ROUTE[normalized];
  }

  const nested = Object.entries(PERMISSION_BY_ROUTE)
    .filter(([route]) => route !== "/" && normalized.startsWith(`${route}/`))
    .sort((a, b) => b[0].length - a[0].length);

  if (nested.length > 0) {
    return nested[0][1];
  }

  return undefined;
}

export function canAccessRoute(
  user: User | null | undefined,
  pathname: string,
): boolean {
  const permission = getRoutePermission(pathname);
  if (!permission) return true;
  return can(user, permission);
}
