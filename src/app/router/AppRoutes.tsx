import * as React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AuthLayout } from "@/layout/AuthLayout"
import { DashboardLayout } from "@/layout/DashboardLayout"
import { GuestRoute } from "@/routes/GuestRoute"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { resolveUserRole } from "@/utils/authRole"

import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
const DashboardAdmin = React.lazy(() =>
  import("@/pages/DashboardAdmin").then((m) => ({ default: m.DashboardAdmin })),
)
const Products = React.lazy(() => import("@/pages/system/Products").then((m) => ({ default: m.Products })))
const Categories = React.lazy(() =>
  import("@/pages/system/Categories").then((m) => ({ default: m.Categories })),
)
const Users = React.lazy(() => import("@/pages/system/Users").then((m) => ({ default: m.Users })))
const ProfilePage = React.lazy(() =>
  import("@/pages/admin/ProfilePage").then((m) => ({ default: m.ProfilePage })),
)
import { PlaceholderPage } from "@/components/PlaceholderPage"

const OrdersPage = React.lazy(() =>
  import("@/features/orders/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })),
)
import { SupportChat } from "@/pages/SupportChat"
import { TeamChatPage } from "@/pages/TeamChatPage"
const VouchersPage = React.lazy(() =>
  import("@/pages/admin/VouchersPage").then((m) => ({ default: m.VouchersPage })),
)

const RouteFallback = () => {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

const Lazy = ({ children }: { children: React.ReactNode }) => {
  return <React.Suspense fallback={<RouteFallback />}>{children}</React.Suspense>
}

const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-muted-foreground">You do not have permission to access this page.</p>
    </div>
  )
}

const RootRedirect = () => {
  const { token, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const role = resolveUserRole(user as unknown as Record<string, unknown> | null)

  // Admin app: only roleID=2 ("admin") may proceed.
  if (role !== "admin") {
    return <Navigate to="/unauthorized" replace />
  }

  return <Navigate to="/system/dashboard-admin" replace />
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/system/dashboard-admin"
          element={
            <Lazy>
              <DashboardAdmin />
            </Lazy>
          }
        />

        <Route
          path="/system/orders"
          element={
            <Lazy>
              <OrdersPage />
            </Lazy>
          }
        />
        <Route
          path="/system/products"
          element={
            <Lazy>
              <Products />
            </Lazy>
          }
        />
        <Route
          path="/system/categories"
          element={
            <Lazy>
              <Categories />
            </Lazy>
          }
        />
        <Route
          path="/system/users"
          element={
            <Lazy>
              <Users />
            </Lazy>
          }
        />
        <Route
          path="/system/profile"
          element={
            <Lazy>
              <ProfilePage />
            </Lazy>
          }
        />
        <Route path="/system/team-chat" element={<TeamChatPage />} />
        <Route
          path="/admin/vouchers"
          element={
            <Lazy>
              <VouchersPage />
            </Lazy>
          }
        />

        <Route path="/blocks" element={<PlaceholderPage title="Blocks" />} />
        <Route path="/landing" element={<PlaceholderPage title="Landing" />} />

        <Route path="/faqs" element={<PlaceholderPage title="FAQs" />} />
        <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
      </Route>

      <Route
        path="/support"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <SupportChat />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
