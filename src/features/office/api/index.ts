// Captain/Office-facing team management API
import api from "@/lib/api/client";
import type { Captain } from "@/features/office/types";
import type { ApiResponse } from "@/shared/types/api";
import type { AddTeamCaptainRequest, UpdateCaptainStatusRequest } from "@/features/office/types/dtos";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

// ── Office Team API ───────────────────────────────────────────────────────────

export async function getTeamCaptains(): Promise<Captain[]> {
  try {
    const response = await api.get<ApiResponse<any>>(
      "/api/office/captains",
    );
    const data = response?.data?.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray((data as any).captains)) {
      return (data as any).captains;
    }
    if (data && Array.isArray((data as any).data)) {
      return (data as any).data;
    }
    return mockProviderDashboardData.captains;
  } catch {
    return mockProviderDashboardData.captains;
  }
}

export async function addTeamCaptain(
  data: AddTeamCaptainRequest,
): Promise<Captain> {
  const response = await api.post<ApiResponse<Captain>>(
    "/api/office/captains",
    data,
  );
  return response.data.data;
}

export async function updateCaptainStatus(
  id: string,
  status: Captain["status"],
): Promise<Captain> {
  const response = await api.put<ApiResponse<Captain>>(
    `/api/office/captains/${id}/status`,
    { status } as UpdateCaptainStatusRequest,
  );
  return response.data.data;
}
