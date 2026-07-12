// Captain/Office-facing tracking (fleet deliveries) API
import api from "@/lib/api/client";
import type { Delivery } from "@/features/tracking/types";
import type { ApiResponse } from "@/shared/types/api";
import type { UpdateDeliveryStatusRequest } from "@/features/tracking/types/dtos";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

// ── Captain Tracking API ──────────────────────────────────────────────────────

export async function getCaptainDeliveries(): Promise<Delivery[]> {
  try {
    const response = await api.get<ApiResponse<{ shipments: any[] }>>(
      "/api/shipments/mine/assigned",
    );
    const shipments = Array.isArray(response.data?.data?.shipments) ? response.data.data.shipments : [];
    return shipments.map((s: any) => {
      let captainName = "Captain";
      if (s.captain) {
        if (typeof s.captain === "object") {
          captainName = s.captain.fullName || s.captain.name || "Captain";
        } else if (typeof s.captain === "string") {
          captainName = s.captain;
        }
      }
      return {
        id: s._id,
        trackingNumber: s.trackingNumber,
        captain: captainName,
        route: `${s.pickupAddress} -> ${s.deliveryAddress}`,
        status: s.status,
        pickupAddress: s.pickupAddress,
        deliveryAddress: s.deliveryAddress,
      };
    });
  } catch {
    return mockProviderDashboardData.deliveries;
  }
}

export async function getDeliveryById(deliveryId: string): Promise<Delivery> {
  const response = await api.get<ApiResponse<any>>(
    `/api/shipments/${deliveryId}`,
  );
  const s = response.data.data;
  return {
    id: s._id,
    captain: s.captain || "Captain",
    route: `${s.pickupAddress} -> ${s.deliveryAddress}`,
    status: s.status,
    pickupAddress: s.pickupAddress,
    deliveryAddress: s.deliveryAddress,
  };
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: Delivery["status"],
): Promise<Delivery> {
  let backendStatus = "assigned";
  if (status === "in_progress") {
    backendStatus = "in_transit";
  } else if (status === "delivered") {
    backendStatus = "delivered";
  }

  await api.post<ApiResponse<any>>(
    `/api/tracking/${deliveryId}/status`,
    {
      status: backendStatus,
      note: `Status updated to ${status} via fleet tracker`,
    } as UpdateDeliveryStatusRequest,
  );

  return getDeliveryById(deliveryId);
}
