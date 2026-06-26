// Customer-facing offers API
import api from "@/lib/api/client";
import type { Offer } from "@/features/offers/types";
import type { ApiResponse } from "@/shared/types/api";

// ── Offers API ────────────────────────────────────────────────────────────────

export function mapOffer(o: any): Offer {
  const providerName = o.offerer?.fullName || (o.offererType === "Driver" ? "Captain Driver" : "Logistics Office");
  const providerAvatar = o.offerer?.profileImage || undefined;
  
  return {
    id: o._id || o.id,
    shipmentId: o.shipment || "",
    providerName,
    providerType: o.offererType?.toLowerCase() === "driver" ? "captain" : "office",
    providerAvatar,
    providerRating: o.offerer?.rating || 4.8,
    reviewCount: o.offerer?.reviewCount || 120,
    price: o.price || 0,
    estDelivery: o.estimatedDelivery || "1 day",
    coverage: o.coverage?.toLowerCase() === "insured" ? "insured" : "none",
    description: o.description || "",
    isBestValue: !!o.isBestValue,
  };
}

// ── Offers API ────────────────────────────────────────────────────────────────

export async function getOffersForShipment(
  shipmentId: string,
): Promise<Offer[]> {
  const response = await api.get<ApiResponse<any[]>>(
    `/api/offers/shipment/${shipmentId}`,
  );
  const offers = response.data.data || [];
  return offers.map(mapOffer);
}

export async function acceptOffer(offerId: string): Promise<void> {
  await api.patch<ApiResponse<void>>(`/api/offers/${offerId}/accept`);
}

export async function rejectOffer(offerId: string): Promise<void> {
  // Not supported on the backend for customers; mock success
  console.log("Rejecting offer (local mock):", offerId);
}

export async function getOfferById(offerId: string): Promise<Offer> {
  // Mock implementation since individual offer GET is not supported on backend
  const response = await api.get<ApiResponse<any[]>>(`/api/offers/mine`);
  const offers = response.data.data || [];
  const offer = offers.find((o) => o._id === offerId || o.id === offerId);
  if (!offer) {
    throw new Error("Offer not found");
  }
  return mapOffer(offer);
}
