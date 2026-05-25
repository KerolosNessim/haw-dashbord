import { useMemo } from "react";
import { usePermission } from "./usePermission";

export function useResourcePermissions(resource: string) {
  const { can, isSuperAdmin } = usePermission();

  return useMemo(
    () => ({
      resource,
      isSuperAdmin,
      view: can(`${resource}.view`),
      create: can(`${resource}.create`),
      update: can(`${resource}.update`),
      delete: can(`${resource}.delete`),
    }),
    [resource, can, isSuperAdmin],
  );
}
