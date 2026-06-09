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
}
