// Placeholder — will be expanded when support API is integrated

export type SupportTicketStatus = "open" | "resolved" | "pending";
export type SupportCategory = "delay" | "billing" | "damage" | "other";

export interface SupportTicket {
  id: string;
  subject: string;
  category: SupportCategory;
  status: SupportTicketStatus;
  message: string;
  shipmentId: string;
  createdAt: string;
}
