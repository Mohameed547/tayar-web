import api from "@/lib/api/client";
import type { SupportTicket } from "../types";
import type { ApiResponse } from "@/shared/types/api";
import type { CreateTicketRequest, UpdateTicketRequest } from "../types/dtos";
import { getShipments } from "@/features/shipments/api";

function mapTicket(t: any): SupportTicket {
  return {
    id: t._id || t.id,
    subject: t.subject || "",
    category: t.category || "other",
    status: t.status || "open",
    message: t.message || "",
    shipmentId: t.relatedShipment || t.shipmentId || "",
    createdAt: t.createdAt || new Date().toISOString(),
  };
}

// ── Support API ───────────────────────────────────────────────────────────────

export async function getTickets(): Promise<SupportTicket[]> {
  const res = await api.get<ApiResponse<any[]>>("/api/support");
  const tickets = res.data.data || [];
  return tickets.map(mapTicket);
}

export async function getTicketById(id: string): Promise<SupportTicket> {
  const res = await api.get<ApiResponse<any>>(`/api/support/${id}`);
  return mapTicket(res.data.data);
}

export async function createTicket(
  data: CreateTicketRequest,
): Promise<SupportTicket> {
  let finalShipmentId = data.shipmentId;
  
  // Resolve SC-XXXXX tracking number to MongoDB ObjectId
  if (/^SC-\d{5}$/i.test(data.shipmentId)) {
    try {
      const shipments = await getShipments();
      const matched = shipments.find(s => s.trackingNumber.toLowerCase() === data.shipmentId.toLowerCase());
      if (matched) {
        finalShipmentId = matched.id;
      }
    } catch (e) {
      console.warn("Failed to resolve tracking number to shipment ID, passing original", e);
    }
  }

  const res = await api.post<ApiResponse<any>>(
    "/api/support",
    {
      subject: data.subject,
      category: data.category,
      message: data.message,
      relatedShipment: finalShipmentId,
    },
  );
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
