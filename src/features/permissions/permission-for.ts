export type PermissionAction = "view" | "create" | "update" | "delete";

export function permissionFor(
  resource: string,
  action: PermissionAction,
): string {
  return `${resource}.${action}`;
}
