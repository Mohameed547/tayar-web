// Captain/Office-facing team management API
import api from "@/lib/api/client";
import type { Captain } from "@/features/office/types";
import type { ApiResponse } from "@/shared/types/api";
import type { AddTeamCaptainRequest, UpdateCaptainStatusRequest } from "@/features/office/types/dtos";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

export function mapCaptain(c: any): Captain {
  return {
    id: c.id || c._id,
    name: c.fullName || c.name || "Captain",
    phone: c.phone || "",
    status: c.status || "offline",
  };
}

// ── Office Team API ───────────────────────────────────────────────────────────

export async function getTeamCaptains(): Promise<Captain[]> {
  try {
    const response = await api.get<ApiResponse<any>>(
      "/api/office/captains",
    );
    const data = response?.data?.data;
    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray((data as any).captains)) {
      list = (data as any).captains;
    } else if (data && Array.isArray((data as any).data)) {
      list = (data as any).data;
    } else {
      return mockProviderDashboardData.captains;
    }

    return list.map((c: any) => ({
      id: c.id || c._id || "",
      name: c.fullName || c.name || "Captain",
      phone: c.phone || "",
      status: c.status || "offline",
    }));
  } catch {
    return mockProviderDashboardData.captains;
  }
}

export async function addTeamCaptain(
  data: AddTeamCaptainRequest,
): Promise<{ captain: Captain; temporaryPassword?: string }> {
  const response = await api.post<ApiResponse<any>>(
    "/api/office/captains",
    data,
  );
  const result = response.data.data;
  return {
    captain: {
      id: result?.captain?.id || result?.captain?._id || "",
      name: result?.captain?.fullName || result?.captain?.name || "",
      phone: result?.captain?.phone || "",
      status: result?.captain?.status || "offline",
    },
    temporaryPassword: result?.temporaryPassword,
  };
}

export async function updateCaptainStatus(
  id: string,
  status: Captain["status"],
): Promise<Captain> {
  const response = await api.patch<ApiResponse<any>>(
    `/api/office/captains/${id}/status`,
    { status } as UpdateCaptainStatusRequest,
  );
  const result = response.data.data;
  return {
    id: result?.id || result?._id || id,
    name: result?.fullName || result?.name || "",
    phone: result?.phone || "",
    status: result?.status || status,
  };
}

export async function updateDriverAvailability(
  status: "available" | "busy" | "offline",
): Promise<any> {
  const response = await api.patch<ApiResponse<any>>(
    "/api/drivers/availability",
    { status }
  );
  return response.data.data;
}

export async function updateOfficeAvailability(
  status: "available" | "offline",
): Promise<any> {
  const response = await api.patch<ApiResponse<any>>(
    "/api/office/availability",
    { status }
  );
  return response.data.data;
}

export async function assignShipmentToCaptain(
  shipmentId: string,
  captainId: string,
): Promise<void> {
  await api.patch<ApiResponse<void>>(
    `/api/office/offers/${shipmentId}/assign/${captainId}`
  );
}

export async function reassignShipmentToCaptain(
  shipmentId: string,
  captainId: string,
): Promise<void> {
  await api.patch<ApiResponse<void>>(
    `/api/office/offers/${shipmentId}/reassign/${captainId}`
  );
}

export async function getCaptainTracking(captainId: string): Promise<any> {
  const response = await api.get<ApiResponse<any>>(
    `/api/office/captains/${captainId}/tracking`
  );
  return response.data.data;
}

export async function getCaptainPerformance(captainId: string): Promise<any> {
  const response = await api.get<ApiResponse<any>>(
    `/api/office/captains/${captainId}/performance`
  );
  return response.data.data;
}
