"use client";

import { Shipment } from "@/types/shipment";
import { Navigation, Eye } from "lucide-react";
import Link from "next/link";

interface ShipmentCardProps {
  shipment: Shipment;
}

export default function ShipmentCard({ shipment }: ShipmentCardProps) {
  const {
    id,
    trackingNumber,
    pickupAddress,
    deliveryAddress,
    status,
    captain,
    etaDescription,
    pickedUpTime,
    deliveryProgressPercent = 0,
  } = shipment;

  const getStatusBadge = () => {
    switch (status) {
      case "in_transit":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            In Transit
          </span>
        );
      case "captain_assignment":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Captain Assignment
          </span>
        );
      case "delivered":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            Delivered
          </span>
        );
      case "pending_offers":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Pending Offers
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 rounded-xl p-5 flex flex-col gap-4 shadow-lg">
      {/* Card Header: Route and Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-500">{trackingNumber}</span>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold text-base">
              <span>{pickupAddress.split(",")[0]}</span>
              <span className="text-zinc-500 font-normal">➔</span>
              <span>{deliveryAddress.split(",")[0]}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            {status === "captain_assignment" ? (
              <span className="text-zinc-500 font-medium">Nour Logistics · Awaiting captain</span>
            ) : (
              <span>
                Captain: {captain?.name || "Unassigned"} {etaDescription ? `· ${etaDescription}` : ""}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {status === "in_transit" && (
            <Link
              href={`/tracking/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-all duration-200"
            >
              <Navigation className="h-3.5 w-3.5 rotate-45" />
              Track
            </Link>
          )}
          {status === "pending_offers" && (
            <Link
              href={`/offers/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all duration-200"
            >
              <Eye className="h-3.5 w-3.5" />
              View Offers
            </Link>
          )}
        </div>
      </div>

      {/* Progress Bar (Only visible when In Transit or Delivered) */}
      {status === "in_transit" && (
        <div className="flex flex-col gap-2 mt-1">
          {/* Track Bar background */}
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${deliveryProgressPercent}%` }}
            />
          </div>
          {/* Progress Markers */}
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1 font-medium">
            <span>Picked up {pickedUpTime || "9:00 AM"}</span>
            <span className="text-blue-400 font-semibold">Delivering... {deliveryProgressPercent}%</span>
            <span>ETA 2:15 PM</span>
          </div>
        </div>
      )}
    </div>
  );
}
