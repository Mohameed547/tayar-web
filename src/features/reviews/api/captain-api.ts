// Captain/Office-facing reviews/rating API
import api from "@/lib/api/client";
import type { ProviderRating } from "@/features/reviews/types";
import type { ApiResponse } from "@/shared/types/api";

// ── Captain/Office Rating API ────────────────────────────────────────────────────────

export async function getProviderRating(role?: "office" | "captain" | "driver"): Promise<ProviderRating> {
  // If role is office, fetch office ratings; otherwise captain ratings.
  const endpoint = role === "office" ? "/api/office/ratings" : "/api/captain/ratings";
  const response = await api.get<ApiResponse<any>>(endpoint);
  const data = response.data.data;
  return {
    averageRating: data.averageRating || 0,
    ratingsCount: data.ratingsCount || 0,
    reviews: data.reviews || [],
    score: data.averageRating || 0,
    totalReviews: data.ratingsCount || 0,
  };
}
