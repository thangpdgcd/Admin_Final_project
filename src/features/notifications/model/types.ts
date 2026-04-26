export type NotificationType = "order" | "chat" | "system" | "voucher"

export type NotificationRow = {
  id: number
  userId: number
  message: string
  type: NotificationType
  isRead: boolean
  createdAt?: string
  updatedAt?: string
}

export type ListNotificationsResponse = {
  items: NotificationRow[]
  total: number
  limit: number
  offset: number
}
