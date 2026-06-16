export type AccountType = "office" | "captain";

export type ScreenId =
  | "overview"
  | "requests"
  | "offers"
  | "orders"
  | "deliveries"
  | "tracking"
  | "earnings"
  | "wallet"
  | "team"
  | "captain-tracking"
  | "performance"
  | "ratings"
  | "verification"
  | "profile";

export interface ShipmentRequest {
  id: string;
  route: string;
  weight: string;
  packageType: string;
  expiresIn: string;
  pickup: string;
  dropoff: string;
}

export interface ProviderOffer {
  id: string;
  requestId: string;
  quoteEGP: number;
  status: "pending" | "accepted" | "rejected" | "expired";
}

export interface ProviderOrder {
  id: string;
  clientName: string;
  priceEGP: number;
  status: "pending_assignment" | "assigned" | "in_progress" | "delivered";
}

export interface Delivery {
  id: string;
  captain: string;
  route: string;
  status: string;
}

export interface Captain {
  id: string;
  name: string;
  phone: string;
  status: "available" | "busy" | "offline";
}

export interface EarningsData {
  thisMonth: number;
  clearedPayouts: number;
  platformFees: number;
  todayEarnings: number;
}

export interface WalletTransaction {
  id: string;
  description: string;
  amountEGP: number;
  type: "credit" | "debit";
  date: string;
}

export interface ProviderWallet {
  balanceEGP: number;
  transactions: WalletTransaction[];
}

export interface ProviderRating {
  score: number;
  totalReviews: number;
  recentNote?: string;
}

export interface VerificationStatus {
  isVerified: boolean;
  complianceText: string;
}

export interface ProviderProfile {
  name: string;
  phone: string;
}

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
