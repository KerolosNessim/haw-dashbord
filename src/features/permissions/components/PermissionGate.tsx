import type { ReactNode } from "react";
import { usePermission } from "../hooks/usePermission";

type PermissionGateProps = {
  permission?: string;
  anyOf?: readonly string[];
  allOf?: readonly string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermission();

  let allowed = true;
  if (permission) allowed = can(permission);
  else if (anyOf?.length) allowed = canAny(anyOf);
  else if (allOf?.length) allowed = canAll(allOf);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

/** Shorthand alias used in JSX as `<Can permission="…">`. */
export function Can(props: PermissionGateProps) {
  return <PermissionGate {...props} />;
}
