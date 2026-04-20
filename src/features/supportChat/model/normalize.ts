import { format, isToday, isYesterday } from "date-fns";
import type { ConversationDto, MessageDto, UiConversation, UiMessage } from "./types";

/** Derive the "other" participant's role id for badges (API uses roleAtJoin or roleID). */
export const pickPeerRoleId = (
  participants: ConversationDto["participants"] | undefined,
  currentUserId?: string
): string | undefined => {
  if (!participants?.length) return undefined;
  type Row = { userId?: number; roleAtJoin?: string; role?: string; name?: string; roleID?: string | number };
  const list = participants.filter(Boolean) as Row[];
  let other =
    currentUserId != null && String(currentUserId).length > 0
      ? list.find((p) => String(p.userId) !== String(currentUserId))
      : undefined;
  if (!other) {
    other = list.find((p) => String(p.roleAtJoin ?? p.role ?? "").toLowerCase() === "staff");
  }
  if (!other) other = list[0];
  const rj = other.roleAtJoin ?? other.role;
  if (rj) {
    const r = String(rj).toLowerCase();
    if (r === "staff") return "3";
    if (r === "admin") return "2";
    if (r === "user" || r === "customer") return "1";
  }
  if (other.roleID != null && `${other.roleID}`.trim() !== "") return String(other.roleID);
  return undefined;
};

export const pickPeerUserId = (
  participants: ConversationDto["participants"] | undefined,
  currentUserId?: string
): number | undefined => {
  if (!participants?.length) return undefined;
  type Row = { userId?: number; name?: string };
  const list = participants.filter(Boolean) as Row[];
  const other =
    currentUserId != null && String(currentUserId).length > 0
      ? list.find((p) => String(p.userId) !== String(currentUserId))
      : list[0];
  return typeof other?.userId === "number" ? other.userId : undefined;
};

const toMs = (iso?: string): number => {
  const ms = iso ? Date.parse(iso) : Number.NaN;
  return Number.isFinite(ms) ? ms : Date.now();
};

export const toTimeLabel = (ms: number): string => format(new Date(ms), "p");

export const toConversationTimestampLabel = (ms: number): string => {
  const d = new Date(ms);
  if (isToday(d)) return format(d, "p");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
};

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((p) => p[0] ?? "");
  const v = chars.join("").toUpperCase();
  return v || "?";
};

export const normalizeConversation = (
  dto: ConversationDto,
  opts?: { currentUserId?: string }
): UiConversation => {
  const updatedAtMs = toMs(dto.updatedAt || dto.createdAt || dto.lastMessage?.createdAt);
  const participantName =
    dto.participants?.find((p) => typeof p?.name === "string" && p.name.trim().length > 0)?.name ??
    "Support";

  const lm = dto.lastMessage;
  const preview =
    lm?.type === "action"
      ? "Updated details"
      : typeof lm?.content === "string"
        ? lm.content
        : typeof lm?.text === "string"
          ? lm.text
          : "";

  const peerRoleId = pickPeerRoleId(dto.participants, opts?.currentUserId);
  const peerUserId = pickPeerUserId(dto.participants, opts?.currentUserId);

  return {
    id: dto.id,
    title: participantName,
    avatarText: initials(participantName),
    preview,
    timestampLabel: toConversationTimestampLabel(updatedAtMs),
    updatedAtMs,
    unread: typeof dto.unreadCount === "number" ? dto.unreadCount : 0,
    peerRoleId,
    peerUserId,
  };
};

export const normalizeMessage = (dto: MessageDto, opts: { direction: UiMessage["direction"] }): UiMessage => {
  const createdAtMs = toMs(dto.createdAt);
  const isText = dto.type === "text";
  const bodyText = dto.content ?? dto.text ?? "";
  return {
    id: String(dto.id),
    serverId: dto.id,
    conversationId: dto.conversationId,
    senderRoleId: dto.senderRoleId,
    type: dto.type,
    text: isText ? bodyText : undefined,
    action: dto.type === "action" ? dto.action : undefined,
    meta: dto.meta,
    createdAtMs,
    timeLabel: toTimeLabel(createdAtMs),
    direction: opts.direction,
    status: "sent",
  };
};

