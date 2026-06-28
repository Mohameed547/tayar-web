// Customer-facing reviews API
import api from "@/lib/api/client";
import type { MyReviewsData, Review } from "@/features/reviews/types";
import type { ApiResponse } from "@/shared/types/api";
import type { CreateReviewRequest } from "@/features/reviews/types/dtos";

// ── Reviews API ───────────────────────────────────────────────────────────────

export async function getReviews(): Promise<MyReviewsData> {
  const res = await api.get<ApiResponse<MyReviewsData>>("/api/reviews/getReview");
  return res.data.data;
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const res = await api.post<ApiResponse<Review>>("/api/reviews/addReview", data);
  return res.data.data;
}
