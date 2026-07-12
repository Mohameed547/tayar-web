// Captain dashboard-ONLY types.
// All domain types (ShipmentRequest, ProviderOffer, Delivery, EarningsData,
// WalletTransaction, ProviderWallet, ProviderRating, VerificationStatus,
// ProviderProfile, Captain) have been moved to their respective domain features.

// ─── Dashboard navigation ─────────────────────────────────────────────────────
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
  | "profile"
  | "support"
  | "notifications"
  | "offices";

// ─── Account mode (office vs individual captain) ──────────────────────────────
export type AccountType = "office" | "captain";
