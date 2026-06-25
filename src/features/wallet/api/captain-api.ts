// Captain/Office-facing wallet + earnings API
import api from "@/lib/api/client";
import type { EarningsData, ProviderWallet, WalletTransaction } from "@/features/wallet/types";
import type { ApiResponse } from "@/shared/types/api";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

function mapWalletTransaction(t: any): WalletTransaction {
  return {
    id: t._id || t.id,
    description: t.description || "",
    amountEGP: t.amount,
    type: t.type === "payment" ? "debit" : "credit",
    date: t.createdAt || t.date || new Date().toISOString(),
  };
}

// ── Captain Wallet API ────────────────────────────────────────────────────────

export async function getCaptainEarnings(): Promise<EarningsData> {
  try {
    const response = await api.get<ApiResponse<any>>("/api/captain/earnings");
    const data = response.data.data;
    return {
      thisMonth: data.monthly || 0,
      clearedPayouts: data.total || 0,
      platformFees: Math.round((data.total || 0) * 0.1), // platform fee is 10%
      todayEarnings: data.daily || 0,
    };
  } catch {
    return mockProviderDashboardData.earnings;
  }
}

export async function getCaptainWallet(): Promise<ProviderWallet> {
  try {
    const response = await api.get<ApiResponse<any>>("/api/wallet");
    const data = response.data.data;
    return {
      balanceEGP: data.balance || 0,
      transactions: (data.transactions || []).map(mapWalletTransaction),
    };
  } catch {
    return mockProviderDashboardData.wallet;
  }
}

export async function getCaptainTransactions(): Promise<WalletTransaction[]> {
  try {
    const response = await api.get<ApiResponse<{ transactions: any[] }>>(
      "/api/wallet/transactions",
    );
    const txs = response.data.data?.transactions || [];
    return txs.map(mapWalletTransaction);
  } catch {
    return mockProviderDashboardData.wallet.transactions;
  }
}
