export interface Conversation {
  id: string
  name: string
  preview: string
  unread: number
  date: string
  online?: boolean
  status?: "online" | "away" | "offline"
  /** Peer role id for UI badges: "3" = staff */
  peerRoleId?: string
}

export interface ChatMessage {
  id: string
  text: string
  senderId: string
  timestamp: string
  isOutgoing: boolean
  /** Present when sender is staff (role id "3") */
  senderRoleId?: string
}
