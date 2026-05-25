import type { NavGroupDef, NavLinkDef } from "@/features/shared/config/dashboard-nav.config";
import { PERMISSION_BY_ROUTE } from "./constants";

export type NavLinkWithPermission = NavLinkDef & {
  permission?: string;
};

export function navLinkPermission(href: string): string | undefined {
  return PERMISSION_BY_ROUTE[href];
}

export function withNavPermissions(
  links: readonly NavLinkDef[],
): NavLinkWithPermission[] {
  return links.map((link) => ({
    ...link,
    permission: navLinkPermission(link.href),
  }));
}

export function filterNavLinks(
  links: readonly NavLinkWithPermission[],
  canView: (permission: string) => boolean,
): NavLinkWithPermission[] {
  return links.filter((link) => !link.permission || canView(link.permission));
}

export function filterNavGroups(
  groups: readonly NavGroupDef[],
  canView: (permission: string) => boolean,
): NavGroupDef[] {
  return groups
    .map((group) => ({
      ...group,
      links: filterNavLinks(withNavPermissions(group.links), canView),
    }))
    .filter((group) => group.links.length > 0);
}
