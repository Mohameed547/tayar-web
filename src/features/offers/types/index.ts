// ─── Customer-facing offer types ─────────────────────────────────────────────
// Source of truth for: modules/customer/types/offer.ts

export interface Offer {
  id: string;
  shipmentId: string;
  providerName: string;
  providerType: "office" | "captain";
  providerAvatar?: string;
  providerRating: number;
  reviewCount: number;
  price: number; // in EGP
  estDelivery: string; // e.g. "1d 4h", "6h"
  coverage: "insured" | "none";
  description: string;
  isBestValue?: boolean;
  providerId?: string;
}

// ─── Captain/Office-facing offer types ───────────────────────────────────────
// Source of truth for: captain/types/provider.ts → ProviderOffer

export interface ProviderOffer {
  id: string;
  requestId: string;
  quoteEGP: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt?: string;
}
