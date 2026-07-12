// ─── Customer-facing tracking types ──────────────────────────────────────────
// Source of truth for: modules/customer/types/tracking.ts

export interface TrackingMilestone {
  step: number;
  title: string;
  timestamp?: string; // e.g., "9:00 AM"
  status: "completed" | "active" | "pending";
  description?: string; // e.g., "Now · 60% complete"
}

// ─── Captain/Office-facing tracking types ─────────────────────────────────────
// Source of truth for: captain/types/provider.ts → Delivery

export interface Delivery {
  id: string;
  trackingNumber?: string;
  captain: string;
  route: string;
  status: string;
  pickupAddress?: string;
  deliveryAddress?: string;
}
