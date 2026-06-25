// ─── Customer-facing wallet types ─────────────────────────────────────────────
// Source of truth for: modules/customer/types/wallet.ts

export interface Transaction {
  id: string;
  type: "payment" | "topup" | "cashback" | "withdraw";
  amount: number;
  description: string;
  date: string;
}

export interface Wallet {
  id: string;
  balance: number;
  cashbackEarned: number;
  transactions: Transaction[];
}

// ─── Captain/Office-facing wallet types ───────────────────────────────────────
// Source of truth for: captain/types/provider.ts → EarningsData, WalletTransaction, ProviderWallet

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
