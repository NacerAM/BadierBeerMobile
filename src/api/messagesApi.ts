import { apiRequest } from "./client";

export type MessageConversation = {
  id: number;
  topicType: "PRODUCT" | "EVENT" | "GLASS" | "ADMIN_SUPPORT" | "DIRECT";
  topicId?: number | null;
  topicLabel: string;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  createdAt?: string;
  unreadCount?: number;
  counterpart?: {
    id: number;
    username: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
};

export type MessageItem = {
  id: number;
  conversationId: number;
  body: string;
  createdAt?: string;
  sender?: {
    id: number;
    username: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
};

export async function listMessageConversationsApi() {
  return apiRequest<{ items: MessageConversation[]; unreadCount?: number }>("/api/messages/conversations", "GET");
}

export async function listMessageUnreadCountApi() {
  return apiRequest<{ unreadCount: number }>("/api/messages/unread-count", "GET");
}

export async function openMessageConversationApi(payload: {
  targetType: "PRODUCT" | "EVENT" | "GLASS" | "ADMIN_SUPPORT" | "DIRECT";
  targetId?: number;
  initialMessage?: string;
}) {
  return apiRequest<MessageConversation>("/api/messages/conversations/open", "POST", payload);
}

export async function getMessageConversationApi(id: number) {
  return apiRequest<MessageConversation>(`/api/messages/conversations/${id}`, "GET");
}

export async function listConversationMessagesApi(id: number) {
  return apiRequest<{ items: MessageItem[] }>(`/api/messages/conversations/${id}/messages`, "GET");
}

export async function sendConversationMessageApi(id: number, body: string) {
  return apiRequest<MessageItem>(`/api/messages/conversations/${id}/messages`, "POST", { body });
}
