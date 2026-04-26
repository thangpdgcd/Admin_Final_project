export type AppRole = "admin" | "staff" | "user"

type UnknownUser = Record<string, unknown> | null | undefined

const normalizeRoleValue = (value: unknown): AppRole | null => {
  if (typeof value === "string") {
    const role = value.toLowerCase()
    if (role === "admin" || role === "staff" || role === "user") return role
  }

  if (typeof value === "number" || typeof value === "string") {
    const roleId = String(value)
    // Backend mapping: 1=user, 2=admin
    if (roleId === "1") return "user"
    if (roleId === "2") return "admin"
    if (roleId === "3") return "staff"
  }

  return null
}

export const resolveUserRole = (user: UnknownUser): AppRole => {
  if (!user) return "user"

  // Prefer numeric role id mapping when present.
  // Some backends may return `role: "staff"` while still sending `roleID: 2` (admin).
  const roleFromId = normalizeRoleValue(user.roleID ?? user.roleId)
  if (roleFromId) return roleFromId

  const directRole = normalizeRoleValue(user.role)
  if (directRole) return directRole

  const roleObject = user.role as Record<string, unknown> | undefined
  if (roleObject) {
    const nested =
      normalizeRoleValue(roleObject.name) ??
      normalizeRoleValue(roleObject.code) ??
      normalizeRoleValue(roleObject._id) ??
      normalizeRoleValue(roleObject.id)
    if (nested) return nested
  }

  return "user"
}
