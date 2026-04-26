export const STAFF_ROLE_ID = "3"

export const isStaffRoleId = (roleId?: string | null): boolean => String(roleId ?? "") === STAFF_ROLE_ID
