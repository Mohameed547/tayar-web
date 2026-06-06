// ─── Auth / User ───────────────────────────────────────────────
export type AccountType = 'office' | 'captain'
export type UserRole    = 'customer' | 'provider' | 'admin'

export interface User {
  id:          string
  name:        string
  email:       string
  phone:       string
  role:        UserRole
  accountType: AccountType
  avatarUrl?:  string
  createdAt:   string
}

// ─── Shipment / Request ────────────────────────────────────────
export type ShipmentStatus =
  | 'draft' | 'awaiting_offers' | 'offer_selected'
  | 'captain_assigned' | 'picked_up' | 'in_transit'
  | 'out_for_delivery' | 'delivered' | 'cancelled' | 'failed'

export interface Request {
  id:          string
  route:       string
  weight:      string
  packageType: string
  expiresIn:   string
  pickup:      string
  dropoff:     string
}

export interface Offer {
  id:             string
  requestId:      string
  quoteEGP:       number
  status:         'pending' | 'accepted' | 'rejected' | 'expired'
}

export interface Order {
  id:         string
  clientName: string
  priceEGP:   number
  status:     'pending_assignment' | 'assigned' | 'in_progress' | 'delivered'
}

export interface Delivery {
  id:             string
  captain:        string
  route:          string
  status:         string
}

export interface Captain {
  id:     string
  name:   string
  phone:  string
  status: 'available' | 'busy' | 'offline'
}

export interface EarningsData {
  thisMonth:      number
  clearedPayouts: number
  platformFees:   number
  todayEarnings:  number
}

export interface Transaction {
  id:          string
  description: string
  amountEGP:   number
  type:        'credit' | 'debit'
  date:        string
}

export interface Wallet {
  balanceEGP:   number
  transactions: Transaction[]
}

export interface Rating {
  score:       number
  totalReviews:number
  recentNote?: string
}

export interface VerificationStatus {
  isVerified:      boolean
  complianceText:  string
}

export interface Profile {
  name:  string
  phone: string
}

// ─── UI State ─────────────────────────────────────────────────
export type ScreenId =
  | 'overview' | 'requests' | 'offers' | 'orders'
  | 'deliveries' | 'tracking' | 'earnings' | 'wallet'
  | 'team' | 'captain-tracking' | 'performance'
  | 'ratings' | 'verification' | 'profile'

export type Theme    = 'light' | 'dark'
export type Language = 'en'   | 'ar'
