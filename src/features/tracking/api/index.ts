// Customer-facing tracking API
import api from "@/lib/api/client";
import type { TrackingMilestone } from "@/features/tracking/types";
import type { ApiResponse } from "@/shared/types/api";
import { getShipments } from "@/features/shipments/api";

function mapMilestones(trackingData: any): TrackingMilestone[] {
  if (!trackingData) return [];
  const milestones = trackingData.milestones || [];
  const currentStatus = trackingData.status || "assigned";
  const progress = trackingData.progressPercent || 0;

  const stages = [
    { key: "assigned", title: "Order Assigned", desc: "Captain has been assigned to your shipment." },
    { key: "picked_up", title: "Picked Up", desc: "Package has been picked up from the sender." },
    { key: "in_transit", title: "In Transit", desc: `In transit to destination · ${progress}% complete` },
    { key: "delivered", title: "Delivered", desc: "Successfully delivered to the recipient." },
  ];

  return stages.map((stage, index) => {
    const logged = milestones.find((m: any) => m.status === stage.key);
    
    let stepStatus: "completed" | "active" | "pending" = "pending";
    if (logged) {
      stepStatus = "completed";
    }
    if (stage.key === currentStatus) {
      stepStatus = "active";
    }

    return {
      step: index + 1,
      title: stage.title,
      timestamp: logged ? new Date(logged.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      status: stepStatus,
      description: stage.key === currentStatus && logged?.note ? logged.note : stage.desc,
    };
  });
}

// ── Tracking API ──────────────────────────────────────────────────────────────

export async function getTrackingMilestones(
  shipmentId: string,
): Promise<TrackingMilestone[]> {
  const response = await api.get<ApiResponse<any>>(
    `/api/tracking/${shipmentId}`,
  );
  return mapMilestones(response.data.data);
}

export async function getTrackingDetails(
  shipmentId: string,
): Promise<any> {
  const response = await api.get<ApiResponse<any>>(
    `/api/tracking/${shipmentId}`,
  );
  return response.data.data;
}

export async function getTrackingByTrackingNumber(
  trackingNumber: string,
): Promise<TrackingMilestone[]> {
  try {
    const shipments = await getShipments();
    const matched = shipments.find(s => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase());
    if (!matched) {
      throw new Error("Shipment not found");
    }
    return getTrackingMilestones(matched.id);
  } catch (err) {
    console.error("Failed to track by tracking number", err);
    throw err;
  }
}
