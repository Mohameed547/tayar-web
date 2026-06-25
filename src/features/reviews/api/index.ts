// Customer-facing reviews API
import api from "@/lib/api/client";
import type { Review } from "@/features/reviews/types";
import type { ApiResponse } from "@/shared/types/api";
import type { CreateReviewRequest } from "@/features/reviews/types/dtos";

// ── Reviews API ───────────────────────────────────────────────────────────────

export async function getReviews(): Promise<Review[]> {
  const res = await api.get<ApiResponse<Review[]>>("/api/reviews");
  return res.data.data;
}

export async function getReviewById(id: string): Promise<Review> {
  const res = await api.get<ApiResponse<Review>>(`/api/reviews/${id}`);
  return res.data.data;
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const res = await api.post<ApiResponse<Review>>("/api/reviews", data);
  return res.data.data;
}
