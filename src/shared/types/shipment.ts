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

import { User } from "./auth";

export interface Shipment {
  id: string;
  trackingNumber: string; // e.g. "SC-00412"
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
  captain?: User & { rating?: number; reviewsCount?: number };
  etaDescription?: string; // e.g. "ETA 2h 15m"
  pickedUpTime?: string; // e.g. "9:00 AM"
  deliveryProgressPercent?: number; // e.g. 60
  selectedOfferId?: string;
  createdAt: string;
}
