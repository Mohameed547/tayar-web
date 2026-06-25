// Customer-facing wallet API
import api from "@/lib/api/client";
import type { Wallet, Transaction } from "@/features/wallet/types";
import type { ApiResponse } from "@/shared/types/api";
import type { TopUpRequest, WithdrawRequest } from "@/features/wallet/types/dtos";

function mapTransaction(t: any): Transaction {
  return {
    id: t._id || t.id,
    type: t.type?.toLowerCase() || "topup",
    amount: t.amount,
    description: t.description || "",
    date: t.createdAt || t.date || new Date().toISOString(),
  };
}

function mapWallet(w: any): Wallet {
  return {
    id: w._id || w.id,
    balance: w.balance || 0,
    cashbackEarned: w.cashbackEarned || 0,
    transactions: (w.transactions || []).map(mapTransaction),
  };
}

// ── Wallet API ────────────────────────────────────────────────────────────────

export async function getWallet(): Promise<Wallet> {
  const response = await api.get<ApiResponse<any>>("/api/wallet");
  return mapWallet(response.data.data);
}

export async function topUp(payload: TopUpRequest): Promise<Wallet> {
  const response = await api.post<ApiResponse<any>>(
    "/api/wallet/topup",
    payload,
  );
  return mapWallet(response.data.data);
}

export async function withdraw(payload: WithdrawRequest): Promise<Wallet> {
  const response = await api.post<ApiResponse<any>>(
    "/api/wallet/withdraw",
    payload,
  );
  return mapWallet(response.data.data);
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await api.get<ApiResponse<{ transactions: any[] }>>(
    "/api/wallet/transactions",
  );
  const txs = response.data.data?.transactions || [];
  return txs.map(mapTransaction);
}
