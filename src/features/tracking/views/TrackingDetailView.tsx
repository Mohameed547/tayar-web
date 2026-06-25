"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, MessageSquare, Ship, Navigation } from "lucide-react";
import { mockShipments, mockOffers } from "@/constants/mock-data";
import TrackingTimeline from "../components/tracking-timeline";
import { useTranslations } from "next-intl";
import { getShipmentById } from "@/features/shipments/api";
import { getOffersForShipment } from "@/features/offers/api";
import type { Shipment } from "@/features/shipments/types";
import type { Offer } from "@/features/offers/types";
import type { TrackingMilestone } from "../types";

interface TrackingDetailViewProps {
  id: string;
  offerId: string | null;
}

export default function TrackingDetailView({ id, offerId }: TrackingDetailViewProps) {
  const t = useTranslations("customer.tracking");

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getShipmentById(id).catch((err) => {
        console.error("Failed to fetch shipment details, using mock fallback:", err);
        return mockShipments.find((s) => s.id === id) || mockShipments[0];
      }),
      getOffersForShipment(id).catch((err) => {
        console.error("Failed to fetch offers, using mock fallback:", err);
        return mockOffers;
      }),
    ]).then(([loadedShipment, loadedOffers]) => {
      setShipment(loadedShipment);
      setOffers(loadedOffers);
      setLoading(false);
    });
  }, [id]);

  if (loading || !shipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold">
        <span>{t("loading") || "Loading tracking details..."}</span>
      </div>
    );
  }

  const captain = shipment.captain;
  const selectedOffer = offers.find((o) => o.id === offerId);
  const displayProvider = selectedOffer
    ? {
        name: selectedOffer.providerName,
        rating: selectedOffer.providerRating,
        avatar: selectedOffer.providerName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        role: selectedOffer.providerType === "office" ? t("office") : t("captain"),
      }
    : captain
    ? {
        name: captain.name,
        rating: captain.rating || 4.9,
        avatar: captain.avatar || "KM",
        role: t("captain"),
      }
    : null;

  const getStatus = (isCompleted: boolean, isActive: boolean): "completed" | "active" | "pending" => {
    if (isCompleted) return "completed";
    if (isActive) return "active";
    return "pending";
  };

  const milestones: TrackingMilestone[] = [
    {
      step: 1,
      title: t("shipmentCreated") || "Shipment created",
      timestamp: shipment.createdAt ? new Date(shipment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      status: getStatus(true, shipment.status === "pending_offers"),
    },
    {
      step: 2,
      title: t("offerAccepted") || "Offer accepted",
      timestamp: shipment.status !== "pending_offers" ? "Completed" : undefined,
      status: getStatus(shipment.status !== "pending_offers", shipment.status === "captain_assignment"),
    },
    {
      step: 3,
      title: t("packagePickedUp") || "Package picked up",
      timestamp: (shipment.status === "in_transit" || shipment.status === "delivered") ? shipment.pickedUpTime || "Completed" : undefined,
      status: getStatus(shipment.status === "in_transit" || shipment.status === "delivered", shipment.status === "in_transit" && (shipment.deliveryProgressPercent ?? 0) < 100),
    },
    {
      step: 4,
      title: t("delivered") || "Delivered",
      timestamp: shipment.status === "delivered" ? "Completed" : undefined,
      status: getStatus(shipment.status === "delivered", shipment.status === "delivered"),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Link
          href="/dashboard"
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            {t("title")}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-[#dbeafe]/10 border border-zinc-800 rounded-xl overflow-hidden shadow-lg relative min-h-[350px] flex flex-col justify-end">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="100" y2="50" stroke="#71717a" strokeWidth="0.8" />
              <line x1="40" y1="0" x2="40" y2="100" stroke="#71717a" strokeWidth="0.8" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="#71717a" strokeWidth="0.8" />
              <line x1="0" y1="35" x2="100" y2="42" stroke="#71717a" strokeWidth="0.4" />
              <path
                d="M20,80 L80,20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            </svg>

            <div className="absolute left-[20%] bottom-[20%] flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-lg shadow-emerald-500/50" />
              <span className="text-[10px] text-zinc-400 font-bold bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800/80 mt-1">
                {t("pickup")}
              </span>
            </div>

            <div className="absolute right-[20%] top-[20%] flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-zinc-950 shadow-lg shadow-red-500/50" />
              <span className="text-[10px] text-zinc-400 font-bold bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800/80 mt-1">
                {t("destination")}
              </span>
            </div>

            <div className="absolute left-[44%] bottom-[44%] flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 border-2 border-white shadow-xl shadow-blue-500/30 animate-pulse">
              <Navigation className="h-4 w-4 text-white rotate-45" />
            </div>
          </div>

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="flex items-center gap-1 bg-zinc-950/95 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-200 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              {t("live")}
            </span>
            <span className="bg-zinc-950/95 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-200 uppercase tracking-wider">
              {t("defaultEta")}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex flex-col">
                  <span className="text-base font-bold text-zinc-100">
                    {shipment.trackingNumber}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {shipment.pickupAddress.split(",")[0]} ➔ {shipment.deliveryAddress.split(",")[0]}
                  </span>
                </div>
                <Ship className="h-5 w-5 text-blue-500" />
              </div>

              <TrackingTimeline milestones={milestones} />
            </div>

            {displayProvider && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-600/10 text-amber-400 font-bold border border-amber-500/20">
                    {displayProvider.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">
                      {displayProvider.name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {displayProvider.rating?.toFixed(1)} ({displayProvider.role})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    aria-label={t("callProvider")}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 hover:bg-zinc-800 transition-colors focus:outline-none"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={t("messageProvider")}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 hover:bg-zinc-800 transition-colors focus:outline-none"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
