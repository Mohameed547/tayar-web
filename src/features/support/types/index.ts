// Placeholder — will be expanded when support API is integrated

export type SupportCategory = string;

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  message: string;
  shipmentId: string;
  createdAt: string;
  messages?: any[];
}
