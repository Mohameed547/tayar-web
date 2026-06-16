export interface TrackingMilestone {
  step: number;
  title: string;
  timestamp?: string; // e.g., "9:00 AM"
  status: "completed" | "active" | "pending";
  description?: string; // e.g., "Now · 60% complete"
}
