import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/shared/components/app-sidebar";
import Navbar from "@/features/shared/components/navbar";
import { useAuthStore } from "@/features/auth/store/user-store";
import { Navigate, Outlet } from "react-router-dom";

export function DashboardLayout() {
  const { user } = useAuthStore()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background">
          <Navbar />
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
