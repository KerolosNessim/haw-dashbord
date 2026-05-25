import type { TFunction } from "i18next";

function normalizeKey(key: string): string {
  return key.replace(/[.-]/g, "_");
}

function parsePermissionName(name: string): { resource: string; action: string } | null {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return null;
  return { resource: name.slice(0, dot), action: name.slice(dot + 1) };
}

export function getPermissionGroupLabel(
  t: TFunction,
  groupKey: string,
  fallback: string,
): string {
  return t(`permission_groups.${normalizeKey(groupKey)}`, { defaultValue: fallback });
}

export function getPermissionLabel(
  t: TFunction,
  permissionName: string,
  fallback: string,
): string {
  const explicit = t(`permission_items.${normalizeKey(permissionName)}`, {
    defaultValue: "",
  });
  if (explicit) return explicit;

  const parsed = parsePermissionName(permissionName);
  if (!parsed) return fallback;

  const resourceKey = normalizeKey(parsed.resource);
  const actionKey = parsed.action;

  const resource = t(`permission_resources.${resourceKey}`, { defaultValue: "" });
  const action = t(`permission_actions.${actionKey}`, { defaultValue: "" });

  if (resource && action) {
    return t("permission_label", { action, resource });
  }

  return fallback;
}
