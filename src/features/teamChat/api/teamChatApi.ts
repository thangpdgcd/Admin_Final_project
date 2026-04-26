import type { AxiosRequestConfig } from "axios"
import { api } from "@/api"
import { unwrapApiData } from "@/utils/apiResponse"

export type TeamMemberRow = {
  userId: number
  name: string | null
  email: string | null
  roleID: string
  phoneNumber?: string | null
}

type ListTeamOpts = {
  /** Avoid duplicate toast when the caller shows an inline error (see AdminStaffMessagesPage). */
  suppressErrorToast?: boolean
}

export const teamChatApi = {
  async listTeamMembers(role: 2 | 3, opts?: ListTeamOpts): Promise<TeamMemberRow[]> {
    const config = {
      params: { role },
      suppressErrorToast: opts?.suppressErrorToast === true,
    } as AxiosRequestConfig & { suppressErrorToast?: boolean }
    const res = await api.get("/staff/team", config)
    const data = unwrapApiData<TeamMemberRow[] | { items?: TeamMemberRow[] }>(res.data)
    if (Array.isArray(data)) return data
    const items = (data as { items?: TeamMemberRow[] }).items
    return Array.isArray(items) ? items : []
  },
}
