import { Outlet, Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/user-store"

export function AuthLayout() {
  const { user } = useAuthStore()
  if (user) {
    return <Navigate to="/" replace />
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <div className="w-full max-w-md p-6 bg-background rounded-xl shadow-lg border">
        <Outlet />
      </div>
    </div>
  )
}
