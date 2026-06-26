// Customer-facing offers API
import api from "@/lib/api/client";
import type { Offer } from "@/features/offers/types";
import type { ApiResponse } from "@/shared/types/api";

// ── Offers API ────────────────────────────────────────────────────────────────

export async function getOffersForShipment(
  shipmentId: string,
): Promise<Offer[]> {
  const response = await api.get<ApiResponse<any[]>>(
    `/api/offers/shipment/${shipmentId}`,
  );
  const data = Array.isArray(response.data?.data) ? response.data.data : [];
  return data.map((o: any) => ({
    id: o._id || o.id,
    shipmentId: o.shipment || shipmentId,
    providerName: o.offerer?.fullName || o.providerName || "Provider",
    providerType: (o.offererType || o.providerType || "office").toLowerCase() === "driver" ? "captain" : "office",
    providerAvatar: o.offerer?.profileImage || o.providerAvatar || "",
    providerRating: o.providerRating ?? 4.8,
    reviewCount: o.reviewCount ?? 140,
    price: o.price ?? 0,
    estDelivery: o.estimatedDelivery || o.estDelivery || "1d",
    coverage: (o.coverage || "none").toLowerCase() === "insured" ? "insured" : "none",
    description: o.description || "",
    isBestValue: !!o.isBestValue,
  }));
}

export async function acceptOffer(offerId: string): Promise<void> {
  await api.patch<ApiResponse<void>>(`/api/offers/${offerId}/accept`);
}

export async function rejectOffer(offerId: string): Promise<void> {
  // Not supported on the backend for customers; mock success
  console.log("Rejecting offer (local mock):", offerId);
}

export async function getOfferById(offerId: string): Promise<Offer> {
  const response = await api.get<ApiResponse<any[]>>(`/api/offers/mine`);
  const data = Array.isArray(response.data?.data) ? response.data.data : [];
  const found = data.find((o) => (o._id || o.id) === offerId);
  if (!found) {
    throw new Error("Offer not found");
  }
  return {
    id: found._id || found.id,
    shipmentId: found.shipment || "",
    providerName: found.offerer?.fullName || found.providerName || "Provider",
    providerType: (found.offererType || found.providerType || "office").toLowerCase() === "driver" ? "captain" : "office",
    providerAvatar: found.offerer?.profileImage || found.providerAvatar || "",
    providerRating: found.providerRating ?? 4.8,
    reviewCount: found.reviewCount ?? 140,
    price: found.price ?? 0,
    estDelivery: found.estimatedDelivery || found.estDelivery || "1d",
    coverage: (found.coverage || "none").toLowerCase() === "insured" ? "insured" : "none",
    description: found.description || "",
    isBestValue: !!found.isBestValue,
  };
}
