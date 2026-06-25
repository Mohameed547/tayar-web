import api from "@/lib/api/client";
import type { Notification } from "../types";
import type { ApiResponse } from "@/shared/types/api";

export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<ApiResponse<Notification[]>>("/api/notifications");
  return res.data.data;
}

export async function markAsRead(id: string): Promise<void> {
  await api.post<ApiResponse<void>>(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.post<ApiResponse<void>>("/api/notifications/read-all");
}
