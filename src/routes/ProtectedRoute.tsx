import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { resolveUserRole } from "@/utils/authRole"

type Role = "admin" | "staff" | "user"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { token, user, isLoading, logout } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRole = resolveUserRole(user as unknown as Record<string, unknown> | null)

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    user &&
    !(allowedRoles as readonly string[]).includes(userRole)
  ) {
    // Admin app: if a non-admin token leaks in (old cookie), clear session and send to login.
    if (allowedRoles.length === 1 && allowedRoles[0] === "admin") {
      logout()
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
