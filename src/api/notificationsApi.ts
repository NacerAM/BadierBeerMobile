import { apiRequest } from "./client";

export type AppNotificationType = "GLASS_VALIDATED" | "GLASS_RATED" | "EVENT_UPCOMING";

export type AppNotification = {
  id: number;
  type: AppNotificationType;
  title: string;
  message: string;
  payload?: {
    glassId?: number;
    fromUserId?: number;
    rating?: number;
    eventId?: number;
    breweryName?: string | null;
    startAt?: string | null;
  } | null;
  readAt?: string | null;
  createdAt?: string;
};

export async function listNotificationsApi() {
  return apiRequest<{ unreadCount: number; items: AppNotification[] }>("/api/notifications", "GET");
}

export async function markNotificationReadApi(id: number) {
  return apiRequest<AppNotification>(`/api/notifications/${id}/read`, "PATCH");
}

export async function markAllNotificationsReadApi() {
  return apiRequest<{ message: string }>("/api/notifications/read-all", "PATCH");
}
