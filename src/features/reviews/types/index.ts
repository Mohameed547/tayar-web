// ─── Customer-facing review types ─────────────────────────────────────────────

export interface Reviewee {
  _id: string;
  fullName: string;
  profileImage?: string;
}

export interface ReviewShipment {
  _id: string;
  trackingNumber: string;
  status: string;
}

export interface Review {
  _id: string;
  shipment: ReviewShipment;
  reviewer: Reviewee;
  revieweeType: "Driver" | "Office";
  reviewee: Reviewee;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface PendingReview {
  _id: string;
  trackingNumber: string;
  revieweeId: string;
  revieweeType: "Driver" | "Office";
  revieweeName: string;
  updatedAt: string;
}

export interface MyReviewsData {
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
  pendingReviewsList: PendingReview[];
  reviews: Review[];
}

// ─── Captain/Office-facing rating types ───────────────────────────────────────

export interface ProviderRating {
  averageRating: number;
  ratingsCount: number;
  reviews: Review[];
  score: number;
  totalReviews: number;
}
