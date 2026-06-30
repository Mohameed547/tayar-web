// ─── Customer-facing profile ─────────────────────────────────────────────────
// Source of truth for: modules/customer/types/customer-profile.ts
export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

// ─── Captain/Office-facing profile ───────────────────────────────────────────
// Source of truth for: captain/types/provider.ts → ProviderProfile
export interface ProviderProfile {
  name: string;
  phone: string;
  avatar?: string;
}
