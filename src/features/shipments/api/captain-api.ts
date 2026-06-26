// Captain/Office-facing shipments API
import api from "@/lib/api/client";
import type { ShipmentRequest, ProviderOrder } from "@/features/shipments/types";
import type { ApiResponse } from "@/shared/types/api";
import type { UpdateOrderStatusRequest } from "@/features/shipments/types/dtos";
import {
  mockProviderDashboardData,
} from "@/features/captain/data/mock-dashboard-data";

// ── Captain Shipments API ─────────────────────────────────────────────────────

export async function getCaptainRequests(): Promise<ShipmentRequest[]> {
  try {
    const response = await api.get<ApiResponse<{ shipments: any[] }>>(
      "/api/shipments/available",
    );
    const shipments = Array.isArray(response.data?.data?.shipments) ? response.data.data.shipments : [];
    return shipments.map((s: any) => ({
      id: s._id,
      route: `${s.pickupAddress} -> ${s.deliveryAddress}`,
      weight: `${s.weight} kg`,
      packageType: s.packageType,
      expiresIn: "",
      pickup: s.pickupAddress,
      dropoff: s.deliveryAddress,
      price: s.price,
      estimatedPriceMin: s.estimatedPriceMin,
      estimatedPriceMax: s.estimatedPriceMax,
    }));
  } catch (error) {
    throw error;
  }
}

export async function getCaptainRequestById(
  id: string,
): Promise<ShipmentRequest> {
  // Return from the list of available requests
  const list = await getCaptainRequests();
  const req = list.find((r) => r.id === id);
  if (!req) {
    throw new Error("Shipment request not found");
  }
  return req;
}

export async function getCaptainOrders(accountType?: "office" | "captain"): Promise<ProviderOrder[]> {
  if (accountType === "office") {
    try {
      const [pendingRes, assignedRes] = await Promise.all([
        api.get<ApiResponse<any[]>>("/api/office/offers"),
        api.get<ApiResponse<any[]>>("/api/office/offers/assigned"),
      ]);
      const pending = Array.isArray(pendingRes.data?.data) ? pendingRes.data.data : [];
      const assigned = Array.isArray(assignedRes.data?.data) ? assignedRes.data.data : [];
      
      const allShipments = [...pending, ...assigned];
      return allShipments.map((s: any) => {
        let frontendStatus: ProviderOrder["status"] = "assigned";
        if (s.status === "delivered") {
          frontendStatus = "delivered";
        } else if (s.status === "in_transit" || s.status === "picked_up" || s.status === "out_for_delivery") {
          frontendStatus = "in_progress";
        } else if (!s.captain) {
          frontendStatus = "pending_assignment";
        }
        
        return {
          id: s.id || s._id,
          clientName: s.customer?.fullName || s.customer?.name || "Client",
          priceEGP: s.price || s.estimatedPriceMax || 0,
          status: frontendStatus,
          captain: s.captain ? {
            id: s.captain.id || s.captain._id || "",
            name: s.captain.fullName || s.captain.name || "",
            phone: s.captain.phone || "",
          } : undefined,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  try {
    const response = await api.get<ApiResponse<{ shipments: any[] }>>(
      "/api/shipments/mine/assigned",
    );
    const shipments = Array.isArray(response.data?.data?.shipments) ? response.data.data.shipments : [];
    return shipments.map((s: any) => {
      let frontendStatus: ProviderOrder["status"] = "assigned";
      if (s.status === "delivered") {
        frontendStatus = "delivered";
      } else if (s.status === "in_transit" || s.status === "picked_up" || s.status === "out_for_delivery") {
        frontendStatus = "in_progress";
      } else if (s.status === "captain_assignment" || s.status === "pending_offers") {
        frontendStatus = "pending_assignment";
      }

      return {
        id: s._id,
        clientName: s.customer?.fullName || s.customer?.name || "Client",
        priceEGP: s.price || s.estimatedPriceMax || 0,
        status: frontendStatus,
      };
    });
  } catch (error) {
    throw error;
  }
}

export async function getCaptainOrderById(id: string): Promise<ProviderOrder> {
  const list = await getCaptainOrders();
  const order = list.find((o) => o.id === id);
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
}

export async function updateOrderStatus(
  id: string,
  data: UpdateOrderStatusRequest,
): Promise<ProviderOrder> {
  let backendStatus = "assigned";
  if (data.status === "in_progress") {
    backendStatus = "in_transit";
  } else if (data.status === "delivered") {
    backendStatus = "delivered";
  }

  await api.post<ApiResponse<any>>(
    `/api/tracking/${id}/status`,
    {
      status: backendStatus,
      note: `Status updated to ${data.status} via captain dashboard`,
    },
  );

  return {
    id,
    clientName: "Client",
    priceEGP: 0,
    status: data.status,
  };
}
