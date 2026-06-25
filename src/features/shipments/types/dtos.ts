// Shipment feature – request / response DTOs
import type { PackageType, DeliverySpeed } from "./index";

// ── Customer-facing request DTOs ──────────────────────────────────────────────

export interface CreateShipmentRequest {
  pickupAddress: string;
  deliveryAddress: string;
  pickupCoords: [number, number];
  deliveryCoords: [number, number];
  weight: number;
  packageType: PackageType;
  deliverySpeed: DeliverySpeed;
  notes?: string;
  price?: number;
}

export interface UpdateShipmentRequest {
  pickupAddress?: string;
  deliveryAddress?: string;
  weight?: number;
  packageType?: PackageType;
  deliverySpeed?: DeliverySpeed;
  notes?: string;
  price?: number;
}

export interface CancelShipmentRequest {
  reason?: string;
}

// ── Captain/Office-facing request DTOs ───────────────────────────────────────

export interface UpdateOrderStatusRequest {
  status: "pending_assignment" | "assigned" | "in_progress" | "delivered";
}
