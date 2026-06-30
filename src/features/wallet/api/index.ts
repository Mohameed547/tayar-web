// Customer-facing wallet API
import api from "@/lib/api/client";
import type { Wallet, Transaction } from "@/features/wallet/types";
import type { ApiResponse } from "@/shared/types/api";
import type { TopUpRequest, WithdrawRequest } from "@/features/wallet/types/dtos";

function mapTransaction(t: any): Transaction {
  let mappedType: "payment" | "topup" | "cashback" | "withdraw" = "payment";
  const purpose = t.purpose?.toLowerCase();
  if (purpose === "topup" || purpose === "deposit") {
    mappedType = "topup";
  } else if (purpose === "withdrawal") {
    mappedType = "withdraw";
  } else if (purpose === "cashback") {
    mappedType = "cashback";
  } else if (purpose === "refund") {
    mappedType = "cashback"; // Refund maps to cashback or credit refund
  }

  const isDebit = t.type === "Debit";
  const amount = isDebit ? -t.amount : t.amount;

  let description = t.description;
  if (!description) {
    if (purpose === "topup") description = "شحن المحفظة (Top-up)";
    else if (purpose === "withdrawal") description = "سحب نقدي (Withdrawal)";
    else if (purpose === "refund") description = "استرداد أموال (Refund)";
    else if (purpose === "payment") description = "دفع خدمة (Payment)";
    else if (purpose === "earning") description = "أرباح توصيل (Earnings)";
    else description = t.purpose || "معاملة مالية";
  }

  return {
    id: t._id || t.id,
    type: mappedType,
    amount,
    description,
    date: t.createdAt || t.date || new Date().toISOString(),
  };
}

// ── Wallet API ────────────────────────────────────────────────────────────────

export async function getWallet(): Promise<Wallet> {
  const [walletRes, txs] = await Promise.all([
    api.get<ApiResponse<any>>("/api/wallet"),
    getTransactions().catch(() => [])
  ]);
  const w = walletRes.data.data;
  return {
    id: w._id || w.id,
    balance: w.balance || 0,
    lockedBalance: w.lockedBalance || 0,
    cashbackEarned: w.cashbackEarned || 0,
    transactions: txs,
  };
}

export async function topUp(payload: TopUpRequest): Promise<any> {
  const gatewayMap: Record<string, string> = {
    visa: "ApplePay",
    mastercard: "ApplePay",
    vodafone_cash: "VodafoneCash",
  };

  const gateway = gatewayMap[payload.paymentMethod] || "ApplePay";

  const response = await api.post<ApiResponse<any>>(
    "/api/wallet/topup",
    {
      amount: payload.amount,
      gateway,
      metadata: {
        phone: payload.phone || "01023456789",
        email: payload.email || "customer@deliverhub.com",
        firstName: payload.firstName || "Customer",
        lastName: payload.lastName || "User",
      },
    }
  );
  
  return response.data.data;
}

export async function withdraw(payload: WithdrawRequest): Promise<any> {
  const isWallet = payload.destination.toLowerCase().includes("vodafone") || 
                   payload.destination.toLowerCase().includes("wallet") || 
                   payload.destination.startsWith("01");
  const destination = isWallet ? "Wallet" : "Bank";

  const body: any = {
    amount: payload.amount,
    destination,
  };

  if (destination === "Wallet") {
    const phoneMatch = payload.destination.match(/01[0-2,5][0-9]{8}/);
    body.mobileWalletNumber = phoneMatch ? phoneMatch[0] : "01023456789";
  } else {
    body.bankAccount = {
      accountHolderName: "Test User",
      bankName: payload.destination || "CIB Bank",
      iban: "EG12345678901234567890123456",
    };
  }

  const response = await api.post<ApiResponse<any>>(
    "/api/wallet/withdraw",
    body,
  );
  return response.data.data;
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await api.get<ApiResponse<{ transactions: any[] }>>(
    "/api/wallet/transactions",
  );
  const txs = response.data.data?.transactions || [];
  return txs.map(mapTransaction);
}
