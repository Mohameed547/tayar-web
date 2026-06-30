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
      <div className="flex items-center justify-center min-h-[400px] text-[var(--dh-text-sub)] text-sm font-semibold">
        <span>{t("loading") || "Loading shipments..."}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-[var(--dh-text-main)] max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--dh-border)] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--dh-text-main)]">{t("title")}</h1>
          <p className="text-xs text-[var(--dh-text-muted)] mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex bg-[var(--dh-bg-muted)] p-1 rounded-xl border border-[var(--dh-border)] text-xs font-semibold">
          {filters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === tab.id
                  ? "bg-[var(--dh-bg-card)] text-[var(--dh-brand)] shadow-sm font-bold"
                  : "text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)]"
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
          <div className="text-center p-12 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] border-dashed rounded-xl">
            <p className="text-sm text-[var(--dh-text-muted)]">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
