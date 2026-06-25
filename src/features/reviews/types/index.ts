// ─── Customer-facing review types ─────────────────────────────────────────────
// Placeholder — will be expanded when review API is integrated

export interface Review {
  id: string;
  captainId: string;
  officeId?: string;
  rating: number;
  comment?: string;
  shipmentId: string;
  createdAt: string;
}

// ─── Captain/Office-facing rating types ───────────────────────────────────────
// Source of truth for: captain/types/provider.ts → ProviderRating

export interface ProviderRating {
  score: number;
  totalReviews: number;
  recentNote?: string;
}
