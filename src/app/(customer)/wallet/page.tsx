"use client";

import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { Transaction } from "@/types/wallet";

export default function WalletPage() {
  const transactions: Transaction[] = [
    {
      id: "tx-1",
      type: "payment",
      amount: -95,
      description: "Payment · SC-00408",
      date: "Yesterday",
    },
    {
      id: "tx-2",
      type: "topup",
      amount: 400,
      description: "Top-up · Visa ••••4242",
      date: "3 days ago",
    },
    {
      id: "tx-3",
      type: "cashback",
      amount: 14.50,
      description: "Cashback · SC-00405",
      date: "1 week ago",
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">Wallet</h1>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Balance & Summary Cards */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Balance Card Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-5">
            <div className="bg-[#0b1024] border border-blue-950/40 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 h-24 w-24 bg-blue-600/5 rounded-full blur-xl -z-10" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Available Balance
                  </span>
                  <p className="text-3xl font-extrabold text-zinc-100 mt-1.5">
                    EGP 320.00
                  </p>
                </div>
                <div className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <WalletIcon className="h-5 w-5 text-blue-400" />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-800/60 pt-3 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-zinc-500 font-medium">Wallet ID</span>
                  <span className="text-zinc-300 font-bold mt-0.5">SC-W-00412</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-zinc-500 font-medium">Cashback earned</span>
                  <span className="text-emerald-400 font-bold mt-0.5">+EGP 14.50</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-905 transition-all focus:outline-none">
                <Plus className="h-3.5 w-3.5" />
                <span>Top Up</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-905 transition-all focus:outline-none">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Row of Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Summary Card 1: Loaded */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                Total Loaded
              </span>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xs font-bold text-zinc-200">EGP 400.00</span>
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </div>
            </div>

            {/* Summary Card 2: Spent */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                Total Paid
              </span>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xs font-bold text-zinc-200">EGP 95.00</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-red-400 shrink-0" />
              </div>
            </div>

            {/* Summary Card 3: Saved/Cashback */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                Total Saved
              </span>
              <div className="flex items-center justify-between gap-1.5 mt-2">
                <span className="text-xs font-bold text-zinc-200">EGP 14.50</span>
                <TrendingUp className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Transactions */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-3 mb-4">
            Recent Transactions
          </h2>

          <div className="flex flex-col gap-4">
            {transactions.map((tx) => {
              const isNegative = tx.amount < 0 || tx.type === "payment";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b border-zinc-850 pb-3.5 last:border-none last:pb-0"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">
                      {tx.description}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      {tx.date}
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
