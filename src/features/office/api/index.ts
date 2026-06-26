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
    const data = response.data.data;
    if (data && Array.isArray(data.captains)) {
      return data.captains.map(mapCaptain);
    }
    if (Array.isArray(data)) {
      return data.map(mapCaptain);
    }
    return [];
  } catch {
    return mockProviderDashboardData.captains;
  }
}

export async function addTeamCaptain(
  data: AddTeamCaptainRequest,
): Promise<Captain> {
  const response = await api.post<ApiResponse<any>>(
    "/api/office/captains",
    data,
  );
  const captainObj = response.data.data?.captain || response.data.data;
  return mapCaptain(captainObj);
}

export async function updateCaptainStatus(
  id: string,
  status: Captain["status"],
): Promise<Captain> {
  const response = await api.patch<ApiResponse<any>>(
    `/api/office/captains/${id}/status`,
    { status } as UpdateCaptainStatusRequest,
  );
  const captainObj = response.data.data?.captain || response.data.data;
  return mapCaptain(captainObj);
}

export async function assignShipmentToCaptain(
  shipmentId: string,
  captainId: string,
): Promise<any> {
  const response = await api.patch<ApiResponse<any>>(
    `/api/office/offers/${shipmentId}/assign/${captainId}`,
  );
  return response.data.data;
}

export async function reassignShipmentToCaptain(
  shipmentId: string,
  captainId: string,
): Promise<any> {
  const response = await api.patch<ApiResponse<any>>(
    `/api/office/offers/${shipmentId}/reassign/${captainId}`,
  );
  return response.data.data;
}

export async function deleteTeamCaptain(id: string): Promise<any> {
  const response = await api.delete<ApiResponse<any>>(
    `/api/office/captains/${id}`,
  );
  return response.data.data;
}
