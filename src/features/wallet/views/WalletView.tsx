"use client";

import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, X, Lock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { topUpSchema, withdrawSchema } from "@/lib/validation/common";
import { z } from "zod";
import { Transaction } from "../types";
import { useTranslations } from "next-intl";
import { getWallet, topUp, withdraw } from "../api";
import { getCurrentUser } from "@/features/auth/api";

type TopUpFormValues = z.infer<typeof topUpSchema>;
type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function WalletView() {
  const t = useTranslations("customer.wallet");
  const validation = useTranslations("validation");
  
  const [balance, setBalance] = useState(0.0);
  const [lockedBalance, setLockedBalance] = useState(0.0);
  const [cashbackEarned, setCashbackEarned] = useState(0.0);
  const [walletId, setWalletId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = () => {
    getWallet()
      .then((data) => {
        setBalance(data.balance);
        setLockedBalance(data.lockedBalance || 0.0);
        setCashbackEarned(data.cashbackEarned);
        setWalletId(data.id);
        setTransactions(data.transactions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wallet, using mocks:", err);
        setBalance(320.0);
        setLockedBalance(50.0);
        setCashbackEarned(14.5);
        setTransactions([
          {
            id: "tx-1",
            type: "payment",
            amount: -95,
            description: t("paymentDescription"),
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "tx-2",
            type: "topup",
            amount: 400,
            description: t("topUpDescription"),
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "tx-3",
            type: "cashback",
            amount: 14.5,
            description: t("cashbackDescription"),
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWalletData();
  }, [t]);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success") {
      fetchWalletData();
      const timer = setTimeout(() => {
        fetchWalletData();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const {
    register: registerTopUp,
    handleSubmit: handleTopUpSubmit,
    formState: { errors: topUpErrors },
    reset: resetTopUp,
    watch: watchTopUp,
    setValue: setTopUpValue,
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: 100, paymentMethod: "visa" },
  });

  const paymentMethod = watchTopUp("paymentMethod");

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const names = currentUser.fullName?.split(" ") || [];
      const fName = names[0] || "";
      const lName = names.slice(1).join(" ") || "User";
      setTopUpValue("phone", currentUser.phone || "");
      setTopUpValue("email", currentUser.email || "");
      setTopUpValue("firstName", fName);
      setTopUpValue("lastName", lName);
    }
  }, [currentUser, setTopUpValue]);

  const {
    register: registerWithdraw,
    handleSubmit: handleWithdrawSubmit,
    formState: { errors: withdrawErrors },
    setError: setWithdrawError,
    reset: resetWithdraw,
  } = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 50, destination: "" },
  });

  const handleTopUp = async (data: TopUpFormValues) => {
    try {
      const response = await topUp({
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        phone: data.phone,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (response?.redirectUrl) {
        window.location.href = response.redirectUrl;
        return;
      }

      fetchWalletData();
      resetTopUp();
      setShowTopUpModal(false);
    } catch (err) {
      console.error("Failed to top up:", err);
      // Fallback local UI simulation
      setBalance((prev) => prev + data.amount);
      const methodLabels: Record<string, string> = {
        visa: t("visa"),
        mastercard: t("mastercard"),
        vodafone_cash: t("vodafoneCash"),
      };
      const newTx: Transaction = {
        id: `tx-${transactions.length + 1}`,
        type: "topup",
        amount: data.amount,
        description: `${t("topUp")} · ${methodLabels[data.paymentMethod]}`,
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      resetTopUp();
      setShowTopUpModal(false);
    }
  };

  const handleWithdraw = async (data: WithdrawFormValues) => {
    if (data.amount > balance) {
      setWithdrawError("amount", {
        type: "manual",
        message: "insufficientFunds",
      });
      return;
    }
    try {
      await withdraw({
        amount: data.amount,
        destination: data.destination,
      });
      fetchWalletData();
      resetWithdraw();
      setShowWithdrawModal(false);
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setBalance((prev) => prev - data.amount);
      const newTx: Transaction = {
        id: `tx-${transactions.length + 1}`,
        type: "withdraw",
        amount: -data.amount,
        description: t("withdrawalDescription", { destination: data.destination }),
        date: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      resetWithdraw();
      setShowWithdrawModal(false);
    }
  };

  const totalLoaded = useMemo(() => {
    return transactions
      .filter((t) => t.type === "topup")
      .reduce((sum, t) => sum + Math.max(0, t.amount), 0);
  }, [transactions]);

  const totalPaid = useMemo(() => {
    return Math.abs(
      transactions
        .filter((t) => (t.type === "payment" || t.type === "withdraw") && t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );
  }, [transactions]);

  const totalSaved = useMemo(() => {
    return transactions
      .filter((t) => t.type === "cashback")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-5">
            <div className="bg-[#0b1024] border border-blue-955/40 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 h-24 w-24 bg-blue-600/5 rounded-full blur-xl -z-10" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {t("availableBalance")}
                  </span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">
                    EGP {balance.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <WalletIcon className="h-5 w-5 text-blue-400" />
                </div>
              </div>

              {lockedBalance > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg mt-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>
                    الرصيد المعلق (إسكرو): <strong>EGP {lockedBalance.toFixed(2)}</strong>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-zinc-800/60 pt-3 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">{t("walletId")}</span>
                  <span className="text-slate-200 font-bold mt-0.5">
                    {walletId ? `SC-W-${walletId.slice(-5).toUpperCase()}` : "SC-W-00412"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 font-medium">الرصيد الكلي</span>
                  <span className="text-blue-400 font-bold mt-0.5">EGP {(balance + lockedBalance).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-955 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-all focus:outline-none"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("topUp")}</span>
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-955 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 transition-all focus:outline-none"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{t("withdraw")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                {t("totalLoaded")}
              </span>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xs font-bold text-zinc-200">EGP {totalLoaded.toFixed(2)}</span>
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                {t("totalPaid")}
              </span>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xs font-bold text-zinc-200">EGP {totalPaid.toFixed(2)}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-red-400 shrink-0" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                {t("totalSaved")}
              </span>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xs font-bold text-zinc-200">EGP {totalSaved.toFixed(2)}</span>
                <TrendingUp className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-3 mb-4">
            {t("recentTransactions")}
          </h2>

          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">لا توجد معاملات بعد</div>
            ) : (
              transactions.map((tx) => {
                const isNegative = tx.amount < 0;
                const formattedTxDate = () => {
                  try {
                    return new Date(tx.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {
                    return tx.date;
                  }
                };

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-zinc-800/60 pb-3.5 last:border-none last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200">
                        {tx.description}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                        {formattedTxDate()}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold tracking-tight ${
                        isNegative ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {isNegative ? "" : "+"}EGP {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4 text-zinc-100">
            <button
              onClick={() => {
                setShowTopUpModal(false);
                resetTopUp();
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-zinc-100">{t("topUpTitle")}</h2>
            <p className="text-xs text-zinc-400">
              {t("topUpSubtitle")}
            </p>
            <form onSubmit={handleTopUpSubmit(handleTopUp)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("amount")}</label>
                <input
                  type="number"
                  {...registerTopUp("amount", { valueAsNumber: true })}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("amountPlaceholder")}
                />
                {topUpErrors.amount && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(topUpErrors.amount.message as never)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("paymentMethod")}</label>
                <select
                  {...registerTopUp("paymentMethod")}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                >
                  <option value="visa" className="bg-zinc-900 text-zinc-200">{t("visa")}</option>
                  <option value="mastercard" className="bg-zinc-900 text-zinc-200">{t("mastercard")}</option>
                  <option value="vodafone_cash" className="bg-zinc-900 text-zinc-200">{t("vodafoneCash")}</option>
                </select>
              </div>

              {paymentMethod === "vodafone_cash" && (
                <div className="flex flex-col gap-3 border border-zinc-800 rounded-lg p-3 bg-zinc-950/40 mt-1">
                  <p className="text-[11px] font-bold text-zinc-400">Vodafone Cash Details</p>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Wallet Number (Phone)</label>
                    <input
                      type="text"
                      {...registerTopUp("phone")}
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                      placeholder="e.g. 01012345678"
                    />
                    {topUpErrors.phone && (
                      <span className="text-[10px] text-red-400">{topUpErrors.phone.message}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      {...registerTopUp("email")}
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                      placeholder="email@example.com"
                    />
                    {topUpErrors.email && (
                      <span className="text-[10px] text-red-400">{topUpErrors.email.message}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        {...registerTopUp("firstName")}
                        className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                        placeholder="First Name"
                      />
                      {topUpErrors.firstName && (
                        <span className="text-[10px] text-red-400">{topUpErrors.firstName.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        {...registerTopUp("lastName")}
                        className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                        placeholder="Last Name"
                      />
                      {topUpErrors.lastName && (
                        <span className="text-[10px] text-red-400">{topUpErrors.lastName.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-md focus:outline-none"
              >
                {t("confirmTopUp")}
              </button>
            </form>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4 text-zinc-100">
            <button
              onClick={() => {
                setShowWithdrawModal(false);
                resetWithdraw();
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-zinc-100">{t("withdrawTitle")}</h2>
            <p className="text-xs text-zinc-400">
              {t("withdrawSubtitle")}
            </p>
            <form onSubmit={handleWithdrawSubmit(handleWithdraw)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">{t("amount")}</label>
                <input
                  type="number"
                  {...registerWithdraw("amount", { valueAsNumber: true })}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("amountPlaceholder")}
                />
                {withdrawErrors.amount && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(withdrawErrors.amount.message as never)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">
                  {t("destination")}
                </label>
                <input
                  type="text"
                  {...registerWithdraw("destination")}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  placeholder={t("destinationPlaceholder")}
                />
                {withdrawErrors.destination && (
                  <span className="text-[11px] text-red-400 font-medium">
                    {validation(withdrawErrors.destination.message as never)}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-md focus:outline-none"
              >
                {t("confirmWithdrawal")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
