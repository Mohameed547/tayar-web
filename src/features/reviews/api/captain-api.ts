// Captain/Office-facing reviews/rating API
import api from "@/lib/api/client";
import type { ProviderRating } from "@/features/reviews/types";
import type { ApiResponse } from "@/shared/types/api";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

// ── Captain Rating API ────────────────────────────────────────────────────────

export async function getProviderRating(): Promise<ProviderRating> {
  try {
    const response = await api.get<ApiResponse<ProviderRating>>(
      "/api/reviews/rating",
    );
    return response.data.data;
  } catch {
    return mockProviderDashboardData.rating;
  }
}
