"use client";

import Link from "next/link";
import { Eye, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Shipment, ShipmentStatus } from "@/features/shipments/types";

interface ShipmentCardProps {
  shipment: Shipment;
}

export default function ShipmentCard({ shipment }: ShipmentCardProps) {
  const t = useTranslations("customer.shipments");
  const {
    id,
    trackingNumber,
    pickupAddress,
    deliveryAddress,
    status,
    captain,
    pickedUpTime,
    deliveryProgressPercent = 0,
  } = shipment;

  const statusStyles: Record<ShipmentStatus, string> = {
    in_transit: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    captain_assignment: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    delivered: "bg-green-500/10 text-green-400 border-green-500/20",
    pending_offers: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    picked_up: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    out_for_delivery: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const statusLabels: Record<ShipmentStatus, string> = {
    in_transit: t("inTransit"),
    captain_assignment: captain ? t("captainAssigned") : t("captainAssignment"),
    delivered: t("delivered"),
    pending_offers: t("pendingOffers"),
    picked_up: t("pickedUpStatus"),
    out_for_delivery: t("outForDelivery"),
    cancelled: t("cancelled"),
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 rounded-xl p-5 flex flex-col gap-4 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-500">{trackingNumber}</span>
            <span className="text-zinc-700">·</span>
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-base">
              <span>{pickupAddress.split(",")[0]}</span>
              <span className="text-zinc-500 font-normal">→</span>
              <span>{deliveryAddress.split(",")[0]}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            {status === "captain_assignment" && !captain ? (
              <span className="text-zinc-500 font-medium">
                Nour Logistics · {t("awaitingCaptain")}
              </span>
            ) : (
              <span>
                {t("captain", { name: captain?.name || t("unassigned") })}
                {` · ${t("eta", { time: t("etaDuration") })}`}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}
          >
            {status === "in_transit" && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            )}
            {statusLabels[status]}
          </span>
          {status === "in_transit" && (
            <Link
              href={`/tracking/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-all duration-200"
            >
              <Navigation className="h-3.5 w-3.5 rotate-45" />
              {t("track")}
            </Link>
          )}
          {status === "pending_offers" && (
            <Link
              href={`/offers/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("viewOffers")}
            </Link>
          )}
        </div>
      </div>

      {status === "in_transit" && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${deliveryProgressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1 font-medium">
            <span>{t("pickedUp", { time: pickedUpTime || "9:00 AM" })}</span>
            <span className="text-blue-400 font-semibold">
              {t("delivering", { progress: deliveryProgressPercent })}
            </span>
            <span>{t("eta", { time: t("etaDuration") })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
