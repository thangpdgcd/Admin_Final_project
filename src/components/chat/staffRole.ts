export const STAFF_ROLE_ID = "3"

export function isStaffRoleId(roleId?: string | null): boolean {
  return String(roleId ?? "") === STAFF_ROLE_ID
}

