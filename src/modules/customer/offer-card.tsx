"use client";

import { Offer } from "@/shared/types/offer";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface OfferCardProps {
  offer: Offer;
  isSelected: boolean;
  onSelect: () => void;
}

export default function OfferCard({ offer, isSelected, onSelect }: OfferCardProps) {
  const {
    providerName,
    providerType,
    providerRating,
    reviewCount,
    price,
    estDelivery,
    coverage,
    description,
    isBestValue,
  } = offer;

  // Initials for avatar
  const initials = providerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex flex-col justify-between bg-zinc-900 border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:border-zinc-700 shadow-md",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20 bg-zinc-900/90 shadow-blue-950/20 shadow-xl"
          : "border-zinc-800"
      )}
    >
      {/* Top Section: Provider Meta */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar Initials */}
            <div
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-lg font-bold text-sm shrink-0",
                providerType === "office"
                  ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-600/10 text-amber-400 border border-amber-500/20"
              )}
            >
              {initials}
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-zinc-100 text-sm leading-tight">
                {providerName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">
                  {providerRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-zinc-500">
                  ({reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Badges on Right */}
          <div className="flex flex-col gap-1.5 items-end">
            {isBestValue && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                Best Value
              </span>
            )}
            {providerType === "captain" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-emerald-400 border border-zinc-700 uppercase tracking-wider">
                Captain
              </span>
            )}
          </div>
        </div>

        {/* Middle Stats Grid */}
        <div className="grid grid-cols-3 border-y border-zinc-800/60 py-3.5 my-1 text-center">
          <div className="flex flex-col items-center">
            <span className="text-blue-400 font-bold text-base">EGP {price}</span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">Price</span>
          </div>
          <div className="flex flex-col items-center border-x border-zinc-800/60">
            <span className="text-zinc-200 font-bold text-base">{estDelivery}</span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">Est. delivery</span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "font-bold text-base",
                coverage === "insured" ? "text-emerald-400" : "text-zinc-500"
              )}
            >
              {coverage === "insured" ? "Insured" : "None"}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">Coverage</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-zinc-400 leading-relaxed min-h-[32px]">
          {description}
        </p>
      </div>

      {/* Action Select Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          "w-full mt-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 focus:outline-none",
          isSelected
            ? "bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20"
            : "bg-transparent text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100"
        )}
      >
        {isSelected ? "Select This Offer" : "Select"}
      </button>
    </div>
  );
}
