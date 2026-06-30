import api from "@/lib/api/client";
import type { SupportTicket } from "../types";
import type { ApiResponse } from "@/shared/types/api";
import type { CreateTicketRequest, UpdateTicketRequest } from "../types/dtos";
import { getShipments } from "@/features/shipments/api";

function mapTicket(t: any): SupportTicket {
  // Backend stores status as "sent" for open tickets; normalise to "open" for the UI
  const rawStatus = t.status || "sent";
  const status = rawStatus === "sent" ? "open" : rawStatus;
  return {
    id: t._id || t.id,
    subject: t.subject || "",
    category: t.category || "other",
    status,
    message: t.message || "",
    shipmentId: t.relatedShipment || t.shipmentId || "",
    createdAt: t.createdAt || new Date().toISOString(),
    messages: t.messages || [],
  };
}

// ── Support API ───────────────────────────────────────────────────────────────

export async function getTickets(): Promise<SupportTicket[]> {
  const res = await api.get<ApiResponse<any>>("/api/support");
  const data = res.data.data;
  const ticketsList = Array.isArray(data) ? data : (data?.tickets || []);
  return ticketsList.map(mapTicket);
}

export async function getTicketById(id: string): Promise<SupportTicket> {
  const res = await api.get<ApiResponse<any>>(`/api/support/${id}`);
  return mapTicket(res.data.data);
}

export async function createTicket(
  data: CreateTicketRequest,
): Promise<SupportTicket> {
  let finalShipmentId = "";
  let isResolvedObjectId = false;

  // Resolve SC-XXXXX tracking number to MongoDB ObjectId
  if (data.shipmentId && data.shipmentId.trim() !== "") {
    const trimmedId = data.shipmentId.trim();
    if (/^SC-\d{5}$/i.test(trimmedId)) {
      const shipments = await getShipments();
      const matched = shipments.find(s => s.trackingNumber.toLowerCase() === trimmedId.toLowerCase());
      if (matched) {
        finalShipmentId = matched.id;
        isResolvedObjectId = true;
      } else {
        throw new Error("رقم الشحنة غير صحيح أو غير موجود بالمنصة");
      }
    } else if (/^[0-9a-fA-F]{24}$/.test(trimmedId)) {
      finalShipmentId = trimmedId;
      isResolvedObjectId = true;
    } else {
      throw new Error("صيغة رقم الشحنة غير صالحة");
    }
  }

  const payload: any = {
    subject: data.subject,
    category: data.category,
    message: data.message,
  };

  if (isResolvedObjectId) {
    payload.relatedShipment = finalShipmentId;
  }

  const res = await api.post<ApiResponse<any>>("/api/support", payload);
  return mapTicket(res.data.data);
}

export async function updateTicket(
  id: string,
  data: UpdateTicketRequest,
): Promise<SupportTicket> {
  // Not supported on the backend; mock success
  console.log("Updating ticket (local mock):", id, data);
  const ticket = await getTicketById(id);
  return {
    ...ticket,
    ...data,
  };
}

export async function closeTicket(id: string): Promise<void> {
  // Not supported on the backend; mock success
  console.log("Closing ticket (local mock):", id);
}

export async function sendTicketMessage(ticketId: string, text: string): Promise<any> {
  const res = await api.post<ApiResponse<any>>(`/api/support/${ticketId}/messages`, { text });
  return res.data.data;
}
