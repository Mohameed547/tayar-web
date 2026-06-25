// ─── Customer-facing shipment types ──────────────────────────────────────────
// Source of truth for: modules/customer/types/shipment.ts
import type { CustomerProfile } from "@/features/profile/types";

export type ShipmentStatus =
  | "pending_offers"
  | "captain_assignment"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PackageType = "small_box" | "medium_box" | "large_box" | "pallet";
export type DeliverySpeed = "standard" | "express" | "scheduled";

export interface Shipment {
  id: string;
  trackingNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupCoords: [number, number];
  deliveryCoords: [number, number];
  weight: number;
  packageType: PackageType;
  deliverySpeed: DeliverySpeed;
  notes?: string;
  status: ShipmentStatus;
  distanceKm: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  price?: number;
  captain?: CustomerProfile & { rating?: number; reviewsCount?: number };
  etaDescription?: string;
  pickedUpTime?: string;
  deliveryProgressPercent?: number;
  selectedOfferId?: string;
  createdAt: string;
}

// ─── Captain/Office-facing shipment types ─────────────────────────────────────
// Source of truth for: captain/types/provider.ts → ShipmentRequest, ProviderOrder

export interface ShipmentRequest {
  id: string;
  route: string;
  weight: string;
  packageType: string;
  expiresIn: string;
  pickup: string;
  dropoff: string;
  price?: number;
  estimatedPriceMin?: number;
  estimatedPriceMax?: number;
}

export interface ProviderOrder {
  id: string;
  clientName: string;
  priceEGP: number;
  status: "pending_assignment" | "assigned" | "in_progress" | "delivered";
}
