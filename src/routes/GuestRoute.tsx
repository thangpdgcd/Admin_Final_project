import * as React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { resolveUserRole } from "@/utils/authRole"

interface GuestRouteProps {
  children: React.ReactNode
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { token, user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (token && user) {
    const role = resolveUserRole(user as unknown as Record<string, unknown>)

    if (role === "admin") {
      return <Navigate to="/system/dashboard-admin" replace />
    }
    // Admin app: if a non-admin is authenticated (old session/cookie),
    // clear session and allow access to login/register pages.
    return <GuestRoleMismatch onLogout={logout}>{children}</GuestRoleMismatch>
  }

  return <>{children}</>
}

const GuestRoleMismatch = ({ onLogout, children }: { onLogout: () => void; children: React.ReactNode }) => {
  React.useEffect(() => {
    onLogout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>{children}</>
}
