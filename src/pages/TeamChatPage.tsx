import { useAuth } from "@/hooks/useAuth"
import { resolveUserRole } from "@/utils/authRole"
import { AdminStaffMessagesPage } from "@/pages/AdminStaffMessagesPage"
import { StaffAdminMessagesPage } from "@/pages/StaffAdminMessagesPage"

/** Routes admin → staff UI and staff → admin UI on the same path `/system/team-chat`. */
export const TeamChatPage = () => {
  const { user } = useAuth()
  const role = resolveUserRole(user as unknown as Record<string, unknown> | null)
  if (role === "staff") return <StaffAdminMessagesPage />
  return <AdminStaffMessagesPage />
}
