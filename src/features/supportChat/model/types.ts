export type SupportMessageType = "text" | "action";

export type SupportActionType = "UPDATE_USER" | "UPDATE_STAFF";

export type SupportActionMeta = {
  targetUserId: number;
  patch: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
};

export type SupportMessageContent =
  | { type: "text"; content: string }
  | { type: "action"; action: SupportActionType; meta: SupportActionMeta };

export type SupportUser = {
  id: number;
  name: string;
  avatar?: string | null;
  role?: "admin" | "staff" | "user" | string;
};

/** Matches API `conversation_participants` + optional user fields */
export type ConversationParticipantDto = {
  userId?: number;
  roleAtJoin?: string;
  name?: string;
  role?: string;
  roleID?: string | number;
};

export type ConversationDto = {
  id: number;
  participants?: (SupportUser | ConversationParticipantDto)[];
  lastMessage?: MessageDto | null;
  unreadCount?: number;
  updatedAt?: string;
  createdAt?: string;
};

export type MessageDto = {
  id: number;
  conversationId: number;
  senderUserId?: number;
  /** Backend Users.roleID: "1" user, "2" admin, "3" staff */
  senderRoleId?: string;
  recipientUserId?: number;
  type: SupportMessageType;
  content?: string;
  /** Raw DB field when API returns `text` instead of `content` */
  text?: string;
  action?: SupportActionType;
  meta?: unknown;
  createdAt?: string;
};

export type UiConversation = {
  id: number;
  title: string;
  avatarText: string;
  preview: string;
  timestampLabel: string;
  updatedAtMs: number;
  unread: number;
  /** Other participant's role id: "1" user, "2" admin, "3" staff */
  peerRoleId?: string;
  /** Other participant's userId (needed for sending vouchers). */
  peerUserId?: number;
};

export type UiMessage = {
  id: string;
  serverId?: number;
  conversationId?: number;
  senderRoleId?: string;
  type: SupportMessageType;
  text?: string;
  action?: SupportActionType;
  meta?: unknown;
  createdAtMs: number;
  timeLabel: string;
  direction: "outgoing" | "incoming";
  status?: "sending" | "sent" | "failed";
  clientNonce?: string;
};

