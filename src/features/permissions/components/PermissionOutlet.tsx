import { usePermission } from "../hooks/usePermission";
import { canAccessRoute } from "../route-permission";
import { AccessDeniedPage } from "@/pages/AccessDeniedPage";
import { Outlet, useLocation } from "react-router-dom";

export function PermissionOutlet() {
  const location = useLocation();
  const { user } = usePermission();

  if (!canAccessRoute(user, location.pathname)) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
}
