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
  proofOfDelivery?: {
    otpCode: string | null;
    recipientName: string | null;
    signatureImage: string | null;
    packageImage: string | null;
    verifiedAt: string | null;
  };
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
  notes?: string;
  deliverySpeed?: string;
  scheduledDate?: string;
  pickupCoords?: [number, number];
  deliveryCoords?: [number, number];
  trackingNumber?: string;
  createdAt?: string;
}

export interface ProviderOrder {
  id: string;
  clientName: string;
  clientPhone?: string;
  priceEGP: number;
  status: "pending_assignment" | "assigned" | "in_progress" | "delivered";
  rawStatus?: string;
  captain?: {
    id: string;
    name: string;
    phone: string;
  };
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupCoords?: [number, number];
  deliveryCoords?: [number, number];
  captainStatus?: string;
  officeDiscountPercentage?: number;
  captainPrice?: number;
  proofOfDelivery?: {
    otpCode: string | null;
    recipientName: string | null;
    signatureImage: string | null;
    packageImage: string | null;
    verifiedAt: string | null;
  };
}
