// Mock data for the captain/office dashboard.
// Types are now sourced from their canonical domain features.
import type { AccountType } from "@/features/captain/types";
import type { ShipmentRequest, ProviderOrder } from "@/features/shipments/types";
import type { ProviderOffer } from "@/features/offers/types";
import type { Delivery } from "@/features/tracking/types";
import type { Captain } from "@/features/office/types";
import type { EarningsData, ProviderWallet } from "@/features/wallet/types";
import type { ProviderRating } from "@/features/reviews/types";
import type { VerificationStatus } from "@/features/verification/types";
import type { ProviderProfile } from "@/features/profile/types";

// Aggregate shape for the dashboard data slice
export interface ProviderDashboardData {
  requests: ShipmentRequest[];
  offers: ProviderOffer[];
  orders: ProviderOrder[];
  deliveries: Delivery[];
  captains: Captain[];
  earnings: EarningsData;
  wallet: ProviderWallet;
  rating: ProviderRating;
}

export const mockProviderDashboardData: ProviderDashboardData = {
  requests: [
    {
      id: "#SR-9921",
      route: "Heliopolis -> Al Agami, Alexandria",
      weight: "5 kg",
      packageType: "Electronics",
      expiresIn: "20m",
      pickup: "Heliopolis, Cairo",
      dropoff: "Al Agami, Alexandria",
      price: 450,
      estimatedPriceMin: 400,
      estimatedPriceMax: 500,
    },
    {
      id: "#SR-9922",
      route: "Maadi -> Nasr City",
      weight: "3 kg",
      packageType: "Documents",
      expiresIn: "1h",
      pickup: "Maadi, Cairo",
      dropoff: "Nasr City, Cairo",
      price: 280,
      estimatedPriceMin: 250,
      estimatedPriceMax: 300,
    },
    {
      id: "#SR-9923",
      route: "Giza -> Port Said",
      weight: "22 kg",
      packageType: "Furniture",
      expiresIn: "2h",
      pickup: "Giza, Cairo",
      dropoff: "Port Said",
      price: 620,
      estimatedPriceMin: 600,
      estimatedPriceMax: 700,
    },
  ],
  offers: [
    { id: "OFF-001", requestId: "#SR-9921", quoteEGP: 450, status: "pending" },
    { id: "OFF-002", requestId: "#SR-9920", quoteEGP: 280, status: "accepted" },
    { id: "OFF-003", requestId: "#SR-9919", quoteEGP: 620, status: "rejected" },
  ],
  orders: [
    {
      id: "#ORD-7721",
      clientName: "Ahmed M.",
      priceEGP: 600,
      status: "pending_assignment",
    },
    {
      id: "#ORD-7720",
      clientName: "Sara K.",
      priceEGP: 350,
      status: "assigned",
    },
  ],
  deliveries: [
    { id: "#ORD-5501", captain: "Captain Ahmed R.", route: "Cairo -> Tanta", status: "On Road" },
    { id: "#ORD-5498", captain: "Captain Mohamed", route: "Giza -> Alexandria", status: "Out for Delivery" },
  ],
  captains: [
    { id: "CAP-01", name: "Mohamed El-Sayed", phone: "01023456789", status: "available" },
    { id: "CAP-02", name: "Ahmed Hossam", phone: "01298765432", status: "busy" },
    { id: "CAP-03", name: "Tarek Hassan", phone: "01112345678", status: "offline" },
  ],
  earnings: {
    thisMonth: 24900,
    clearedPayouts: 18500,
    platformFees: 1200,
    todayEarnings: 4280,
  },
  wallet: {
    balanceEGP: 6400,
    transactions: [
      { id: "T1", description: "Order #ORD-4410 payment", amountEGP: 320, type: "credit", date: "Jun 3, 2026" },
      { id: "T2", description: "Cashout processing", amountEGP: 2000, type: "debit", date: "Jun 2, 2026" },
      { id: "T3", description: "Order #ORD-4408 payment", amountEGP: 520, type: "credit", date: "Jun 1, 2026" },
    ],
  },
  rating: { score: 4.9, totalReviews: 140, averageRating: 4.9, ratingsCount: 140, reviews: [] },
};

export const mockVerificationByAccount: Record<AccountType, VerificationStatus> = {
  office: { isVerified: true, complianceText: "Commercial records and ID card are active." },
  captain: { isVerified: true, complianceText: "National ID verification is active." },
};

export const mockProfileByAccount: Record<AccountType, ProviderProfile> = {
  office: { name: "Sherif Logistics Co.", phone: "+20 100 234 5678" },
  captain: { name: "Mohamed El-Sayed", phone: "+20 112 345 6789" },
};
