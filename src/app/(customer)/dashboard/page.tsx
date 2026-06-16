"use client";

import Link from "next/link";
import { Clock, Package, Plus, Star, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { mockCustomer, mockShipments } from "@/constants/mock-data";
import ShipmentCard from "@/modules/customer/ui/shipment-card";
import StatCard from "@/shared/ui/StatCard";

export default function CustomerDashboard() {
  const t = useTranslations("customer.dashboard");
  const locale = useLocale();
  const activeShipments = mockShipments.filter(
    (shipment) =>
      shipment.status === "in_transit" ||
      shipment.status === "captain_assignment" ||
      shipment.status === "pending_offers"
  );
  const today = new Date("2026-06-05");
  const formattedDate = today.toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="flex flex-col gap-8 text-zinc-100 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {t("greeting", { name: mockCustomer.name.split(" ")[0] })}
          </h1>
          <p className="text-xs text-zinc-500 font-semibold">{formattedDate}</p>
        </div>

        <Link
          href="/shipments/new"
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 shadow-md focus:outline-none"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{t("newShipment")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalShipped")}
          value="24"
          icon={Package}
          description={t("totalShippedDescription")}
          colorClass="text-zinc-100"
          iconColorClass="text-zinc-400 bg-zinc-900 border-zinc-800"
        />
        <StatCard
          title={t("activeNow")}
          value="2"
          icon={Clock}
          description={t("activeNowDescription")}
          colorClass="text-blue-400"
          iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
        />
        <StatCard
          title={t("walletBalance")}
          value="EGP 320"
          icon={Wallet}
          description={t("walletDescription")}
          colorClass="text-emerald-400"
          iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          href="/wallet"
        />
        <StatCard
          title={t("averageRating")}
          value="4.6 ★"
          icon={Star}
          description={t("ratingDescription")}
          colorClass="text-amber-400"
          iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
          href="/reviews"
        />
      </div>

      <div className="flex flex-col gap-4.5 mt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          {t("activeShipments")}
        </h2>

        {activeShipments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-zinc-800 border-dashed rounded-xl text-center">
            <p className="text-xs text-zinc-500">{t("noActive")}</p>
            <Link
              href="/shipments/new"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold mt-2 underline underline-offset-4"
            >
              {t("requestShipment")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
