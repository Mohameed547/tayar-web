// Customer-facing offers API
import api from "@/lib/api/client";
import type { Offer } from "@/features/offers/types";
import type { ApiResponse } from "@/shared/types/api";

// ── Offers API ────────────────────────────────────────────────────────────────

export async function getOffersForShipment(
  shipmentId: string,
): Promise<Offer[]> {
  const response = await api.get<ApiResponse<Offer[]>>(
    `/api/offers/shipment/${shipmentId}`,
  );
  return response.data.data;
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
  const response = await api.get<ApiResponse<Offer[]>>(`/api/offers/mine`);
  const offer = response.data.data.find((o) => o.id === offerId);
  if (!offer) {
    throw new Error("Offer not found");
  }
  return offer;
}
