import { api } from "@/services/api";
import { normalizeList, unwrapApiData } from "@/utils/apiResponse";
import type { ConversationDto, MessageDto, SupportUser } from "../model/types";

export const chatApi = {
  async listConversations(): Promise<ConversationDto[]> {
    const res = await api.get("/api/conversations");
    const { items } = normalizeList<ConversationDto>(res.data, ["conversations", "items", "rows", "data"]);
    return items;
  },

  async getMessages(conversationId: number, params?: { limit?: number; offset?: number }): Promise<MessageDto[]> {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const res = await api.get(`/api/messages/${conversationId}`, {
      params: { limit, offset },
    });
    const { items } = normalizeList<MessageDto>(res.data, ["messages", "items", "rows", "data"]);
    return items;
  },

  async listOnlineStaff(): Promise<SupportUser[]> {
    const res = await api.get("/api/staff/online");
    const data = unwrapApiData<SupportUser[] | { staff?: SupportUser[] }>(res.data);
    if (Array.isArray(data)) return data;
    const staff = (data as { staff?: SupportUser[] }).staff;
    return Array.isArray(staff) ? staff : [];
  },
};

