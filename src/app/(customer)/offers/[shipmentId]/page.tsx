"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { mockOffers, mockShipments } from "@/constants/mock-data";
import OfferCard from "@/modules/customer/offer-card";

export default function CompareOffersPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.shipmentId as string;

  // Find corresponding shipment details
  const shipment = mockShipments.find((s) => s.id === shipmentId) || mockShipments[0];

  // Selected Offer State
  const [selectedOfferId, setSelectedOfferId] = useState<string>("offer-1"); // Nour Logistics selected by default

  const [confirming, setConfirming] = useState(false);

  const handleConfirmOffer = () => {
    setConfirming(true);
    // Simulate accepting transaction
    setTimeout(() => {
      setConfirming(false);
      // Redirect to live tracking dashboard for this shipment
      router.push(`/tracking/${shipment.id}?offerId=${selectedOfferId}`);
    }, 1000);
  };



  const getSpeedLabel = (val: string) => {
    switch (val) {
      case "standard":
        return "Standard";
      case "express":
        return "Express";
      case "scheduled":
        return "Scheduled";
      default:
        return val;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-5xl mx-auto">
      {/* Back button and Meta Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              {mockOffers.length} Offers received
            </h1>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-sm font-semibold text-blue-500">
              {shipment.trackingNumber}
            </span>
          </div>
          <p className="text-xs text-zinc-500 ml-8 font-medium">
            {shipment.pickupAddress.split(",")[0]} ➔ {shipment.deliveryAddress.split(",")[0]} • {shipment.weight}kg • {getSpeedLabel(shipment.deliverySpeed)}
          </p>
        </div>

        {/* Action button to accept selection */}
        <button
          onClick={handleConfirmOffer}
          disabled={confirming}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 shadow-md focus:outline-none disabled:bg-blue-800"
        >
          <CheckCircle className="h-4 w-4" />
          <span>{confirming ? "Confirming..." : "Accept Selected Offer"}</span>
        </button>
      </div>

      {/* Filter and Sort actions */}
      <div className="flex justify-end gap-2.5">
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all focus:outline-none">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filter</span>
        </button>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all focus:outline-none">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Sort: Price</span>
        </button>
      </div>

      {/* Grid listing of Offer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        {mockOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            isSelected={selectedOfferId === offer.id}
            onSelect={() => setSelectedOfferId(offer.id)}
          />
        ))}
      </div>
    </div>
  );
}
