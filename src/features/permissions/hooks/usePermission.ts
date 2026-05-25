import { useAuthStore } from "@/features/auth/store/user-store";
import { can, canAll, canAny, isSuperAdmin } from "../can";

export function usePermission() {
  const user = useAuthStore((s) => s.user);

  return {
    user,
    isSuperAdmin: isSuperAdmin(user),
    can: (permission: string) => can(user, permission),
    canAny: (permissions: readonly string[]) => canAny(user, permissions),
    canAll: (permissions: readonly string[]) => canAll(user, permissions),
  };
}
