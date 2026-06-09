"use client";

import { useState } from "react";
import { mockShipments } from "@/constants/mock-data";
import ShipmentCard from "@/modules/customer/ui/shipment-card";
export default function MyShipmentsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "pending" | "completed">("all");

  const filteredShipments = mockShipments.filter((shipment) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return shipment.status === "in_transit" || shipment.status === "captain_assignment";
    if (activeFilter === "pending") return shipment.status === "pending_offers";
    if (activeFilter === "completed") return shipment.status === "delivered";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">My Shipments</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage and monitor your requested routes
          </p>
        </div>

        {/* Filter segment */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as "all" | "active" | "pending" | "completed")}
          className={`px-3 py-1.5 rounded-md transition-all ${activeFilter === tab.id
              ? "bg-zinc-900 border border-zinc-800 text-blue-400"
              : "text-zinc-500 hover:text-zinc-300"
            }`}
            >
          {tab.label}
        </button>
          ))}
      </div>
    </div>

      {/* Shipments List */ }
  <div className="flex flex-col gap-4 mt-2">
    {filteredShipments.length > 0 ? (
      filteredShipments.map((shipment) => (
        <ShipmentCard key={shipment.id} shipment={shipment} />
      ))
    ) : (
      <div className="text-center p-12 bg-zinc-900/40 border border-zinc-800 border-dashed rounded-xl">
        <p className="text-sm text-zinc-500">No shipments found matching this filter.</p>
      </div>
    )}
  </div>
    </div >
  );
}
