import api from "@/lib/api/client";
import type { Notification } from "../types";
import type { ApiResponse } from "@/shared/types/api";

export async function getNotifications(): Promise<any[]> {
  console.log("Calling getNotifications API...");
  try {
    const res = await api.get<ApiResponse<any>>("/api/notifications");
    console.log("getNotifications API response raw:", res.data);
    const data = res.data.data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.notifications)) {
        console.log("Found notifications array:", data.notifications);
        return data.notifications;
      }
      if (Array.isArray(data.docs)) {
        console.log("Found docs array:", data.docs);
        return data.docs;
      }
    }
    console.log("Returning data fallback:", data);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error in getNotifications API:", err);
    throw err;
  }
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch<ApiResponse<void>>(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch<ApiResponse<void>>("/api/notifications/read-all");
}
