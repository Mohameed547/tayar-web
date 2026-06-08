"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Phone, MessageSquare, Ship, Navigation } from "lucide-react";
import { mockShipments, mockTrackingMilestones, mockOffers } from "@/constants/mock-data";
import TrackingTimeline from "@/modules/customer/tracking-timeline";
import { Suspense } from "react";

export default function LiveMapTrackingPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-xs p-6 text-center">Loading tracking details...</div>}>
      <TrackingContent />
    </Suspense>
  );
}

function TrackingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const offerId = searchParams.get("offerId");

  // Find shipment
  const shipment = mockShipments.find((s) => s.id === id) || mockShipments[0];

  const captain = shipment.captain;

  // Dynamically map selected offer details
  const selectedOffer = mockOffers.find((o) => o.id === offerId);
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
        role: selectedOffer.providerType === "office" ? "Office" : "Captain",
      }
    : captain
    ? {
        name: captain.name,
        rating: captain.rating || 4.9,
        avatar: captain.avatar || "KM",
        role: "Captain",
      }
    : null;

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Link
          href="/dashboard"
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Live Map Tracking
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time status updates for your delivery
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Live Map Container */}
        <div className="lg:col-span-7 bg-[#dbeafe]/10 border border-zinc-800 rounded-xl overflow-hidden shadow-lg relative min-h-[350px] flex flex-col justify-end">
          {/* Map graphics canvas */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* SVG street road networks */}
            <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="100" y2="50" stroke="#71717a" strokeWidth="0.8" />
              <line x1="40" y1="0" x2="40" y2="100" stroke="#71717a" strokeWidth="0.8" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="#71717a" strokeWidth="0.8" />
              <line x1="0" y1="35" x2="100" y2="42" stroke="#71717a" strokeWidth="0.4" />
              {/* Route connecting line */}
              <path
                d="M20,80 L80,20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            </svg>

            {/* Custom Markers matching mockup details */}
            {/* Pickup Marker */}
            <div className="absolute left-[20%] bottom-[20%] flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-lg shadow-emerald-500/50" />
              <span className="text-[10px] text-zinc-400 font-bold bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800/80 mt-1">
                Pickup
              </span>
            </div>

            {/* Destination Marker */}
            <div className="absolute right-[20%] top-[20%] flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-zinc-950 shadow-lg shadow-red-500/50" />
              <span className="text-[10px] text-zinc-400 font-bold bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800/80 mt-1">
                Destination
              </span>
            </div>

            {/* Vehicle indicator moving on route */}
            <div className="absolute left-[44%] bottom-[44%] flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 border-2 border-white shadow-xl shadow-blue-500/30 animate-pulse">
              <Navigation className="h-4 w-4 text-white rotate-45" />
            </div>
          </div>

          {/* Absolute Floater Map status tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="flex items-center gap-1 bg-zinc-950/95 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-200 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              Live
            </span>
            <span className="bg-zinc-950/95 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-200 uppercase tracking-wider">
              {shipment.etaDescription || "ETA 2h 15m"}
            </span>
          </div>
        </div>

        {/* Right Column: Tracking Milestones & Captain Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Timeline details panel */}
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

              {/* Milestones list */}
              <TrackingTimeline milestones={mockTrackingMilestones} />
            </div>

            {/* Captain / Provider widget card */}
            {displayProvider && (
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Provider profile initials */}
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

                {/* Quick actions call/chat */}
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 hover:bg-zinc-800 transition-colors focus:outline-none">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 hover:bg-zinc-800 transition-colors focus:outline-none">
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

