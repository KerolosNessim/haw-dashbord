import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useBootstrapAuth } from "@/features/auth/hooks/useBootstrapAuth";
import { AppSidebar } from "@/features/shared/components/app-sidebar";
import Navbar from "@/features/shared/components/navbar";
import { Button } from "@/components/ui/button";
import { PermissionOutlet } from "@/features/permissions/components/PermissionOutlet";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function DashboardLayout() {
  const { t } = useTranslation("translation", { keyPrefix: "auth" });
  const { tokenPresent, isBootstrapping, isAuthenticated, meError, refetchMe } =
    useBootstrapAuth();

  if (!tokenPresent) {
    return <Navigate to="/login" replace />;
  }

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">{t("loading_session")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (meError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
          <p className="text-center text-sm text-destructive">
            {t("session_load_failed")}
          </p>
          <Button type="button" variant="outline" onClick={() => void refetchMe()}>
            {t("retry")}
          </Button>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background">
          <Navbar />
          <div className="p-6">
            <PermissionOutlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
