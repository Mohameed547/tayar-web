"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { mockShipments } from "@/constants/mock-data";
import ShipmentCard from "../components/shipment-card";
import { getShipments } from "@/features/shipments/api";
import type { Shipment } from "@/features/shipments/types";

type ShipmentFilter = "all" | "active" | "pending" | "completed";

export default function CustomerShipmentsView() {
  const t = useTranslations("customer.shipments");
  const [activeFilter, setActiveFilter] = useState<ShipmentFilter>("all");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipments()
      .then((data) => {
        setShipments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch shipments, using mock fallback:", err);
        setShipments(mockShipments);
        setLoading(false);
      });
  }, []);

  const filters: Array<{ id: ShipmentFilter; label: string }> = [
    { id: "all", label: t("all") },
    { id: "active", label: t("active") },
    { id: "pending", label: t("pending") },
    { id: "completed", label: t("completed") },
  ];

  const filteredShipments = shipments.filter((shipment) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return (
        shipment.status === "in_transit" ||
        shipment.status === "captain_assignment"
      );
    }
    if (activeFilter === "pending") return shipment.status === "pending_offers";
    if (activeFilter === "completed") return shipment.status === "delivered";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold">
        <span>{t("loading") || "Loading shipments..."}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-xs text-zinc-500 mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
          {filters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === tab.id
                  ? "bg-zinc-900 border border-zinc-800 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))
        ) : (
          <div className="text-center p-12 bg-zinc-900/40 border border-zinc-800 border-dashed rounded-xl">
            <p className="text-sm text-zinc-500">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
