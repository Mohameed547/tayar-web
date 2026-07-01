// Captain/Office-facing wallet + earnings API
import api from "@/lib/api/client";
import type { EarningsData, ProviderWallet, WalletTransaction } from "@/features/wallet/types";
import type { ApiResponse } from "@/shared/types/api";
import { mockProviderDashboardData } from "@/features/captain/data/mock-dashboard-data";

function mapWalletTransaction(t: any): WalletTransaction {
  const purpose = t.purpose?.toLowerCase();
  let description = t.description;
  if (!description) {
    if (purpose === "topup" || purpose === "deposit") description = "شحن المحفظة (Top-up)";
    else if (purpose === "withdrawal") description = "سحب نقدي (Withdrawal)";
    else if (purpose === "refund") description = "استرداد أموال (Refund)";
    else if (purpose === "payment") description = "دفع خدمة (Payment)";
    else if (purpose === "earning") description = "أرباح توصيل (Earnings)";
    else description = t.purpose || "معاملة مالية";
  }

  return {
    id: t._id || t.id,
    description,
    amountEGP: t.amount,
    type: t.type === "Debit" || t.type === "debit" ? "debit" : "credit",
    date: t.createdAt || t.date || new Date().toISOString(),
  };
}

// ── Captain Wallet API ────────────────────────────────────────────────────────

export async function getCaptainEarnings(role?: "office" | "captain"): Promise<EarningsData> {
  try {
    const url = role === "office" ? "/api/office/earnings" : "/api/captain/earnings";
    const response = await api.get<ApiResponse<any>>(url);
    const data = response.data.data;
    return {
      thisMonth: data.monthly || 0,
      clearedPayouts: data.total || 0,
      platformFees: data.platformFees || 0,
      todayEarnings: data.daily || 0,
    };
  } catch (err) {
    console.error("Failed to load earnings:", err);
    return mockProviderDashboardData.earnings;
  }
}

export async function getCaptainWallet(): Promise<ProviderWallet> {
  try {
    const response = await api.get<ApiResponse<any>>("/api/wallet");
    const data = response.data.data;

    // Fetch transactions
    const txResponse = await api.get<ApiResponse<{ transactions: any[] }>>("/api/wallet/transactions").catch(() => null);
    const txs = txResponse?.data?.data?.transactions || [];

    return {
      balanceEGP: data.balance || 0,
      transactions: txs.map(mapWalletTransaction),
    };
  } catch (err) {
    console.error("Failed to load captain wallet:", err);
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
