export type NotificationType = "pickup" | "offer" | "received" | "delivered" | "info";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  isRead: boolean;
  shipmentId?: string;
}
