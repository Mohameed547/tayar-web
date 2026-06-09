"use client";

import Link from "next/link";
import { Plus, Package, Clock, Wallet, Star } from "lucide-react";
import { mockShipments, mockCustomer } from "@/constants/mock-data";
import ShipmentCard from "@/modules/customer/ui/shipment-card";
// import StatCard from "@/shared/components/stat-card";
import StatCard from "@/shared/ui/StatCard";


export default function CustomerDashboard() {
  // We filter shipments to show active or pending ones on the dashboard
  const activeShipments = mockShipments.filter(
    (s) => s.status === "in_transit" || s.status === "captain_assignment" || s.status === "pending_offers"
  );

  // Set date matching UI mockups
  const today = new Date("2026-06-05");
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 text-zinc-100 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Good morning, {mockCustomer.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-zinc-500 font-semibold">{formattedDate}</p>
        </div>

        <Link
          href="/shipments/new"
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 shadow-md focus:outline-none"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Shipment</span>
        </Link>
      </div>

      {/* Reusable Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shipped */}
        <StatCard
          title="Total Shipped"
          value="24"
          icon={Package}
          description="Packages delivered safely"
          colorClass="text-zinc-100"
          iconColorClass="text-zinc-400 bg-zinc-900 border-zinc-800"
        />

        {/* Active Now */}
        <StatCard
          title="Active Now"
          value="2"
          icon={Clock}
          description="In-transit deliveries"
          colorClass="text-blue-400"
          iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
        />

        {/* Wallet Balance */}
        <StatCard
          title="Wallet Balance"
          value="EGP 320"
          icon={Wallet}
          description="Tap to add funds"
          colorClass="text-emerald-400"
          iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          href="/wallet"
        />

        {/* Avg Rating Given */}
        <StatCard
          title="Avg Rating"
          value="4.6 ★"
          icon={Star}
          description="Reviews submitted"
          colorClass="text-amber-400"
          iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
          href="/reviews"
        />
      </div>

      {/* Active Shipments Section */}
      <div className="flex flex-col gap-4.5 mt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Active Shipments
        </h2>

        {activeShipments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-zinc-800 border-dashed rounded-xl text-center">
            <p className="text-xs text-zinc-500">No active shipments at the moment.</p>
            <Link
              href="/shipments/new"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold mt-2 underline underline-offset-4"
            >
              Request a new shipment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
