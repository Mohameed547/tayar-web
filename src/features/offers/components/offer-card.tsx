"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Offer } from "@/features/offers/types";

interface OfferCardProps {
  offer: Offer;
  isSelected: boolean;
  onSelect: () => void;
}

const descriptionKeys = {
  "offer-1": "description1",
  "offer-2": "description2",
  "offer-3": "description3",
  "offer-4": "description4",
} as const;

const durationKeys = {
  "offer-1": "duration1",
  "offer-2": "duration2",
  "offer-3": "duration3",
  "offer-4": "duration4",
} as const;

export default function OfferCard({ offer, isSelected, onSelect }: OfferCardProps) {
  const t = useTranslations("customer.offers");
  const {
    providerName,
    providerType,
    providerAvatar,
    providerRating,
    reviewCount,
    price,
    coverage,
    isBestValue,
  } = offer;

  const initials = providerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isMockOffer = ["offer-1", "offer-2", "offer-3", "offer-4", "OFF-001", "OFF-002", "OFF-003"].includes(offer.id);

  const descriptionKey =
    descriptionKeys[offer.id as keyof typeof descriptionKeys] ?? "description1";
  const durationKey =
    durationKeys[offer.id as keyof typeof durationKeys] ?? "duration1";

  const displayDuration = isMockOffer ? t(durationKey) : offer.estDelivery;
  const displayDescription = isMockOffer ? t(descriptionKey) : offer.description;

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
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Provider avatar — real photo or initials */}
            {providerAvatar && providerAvatar.startsWith("http") ? (
              <img
                src={providerAvatar}
                alt={providerName}
                className={cn(
                  "h-10 w-10 rounded-lg object-cover shrink-0 border-2",
                  providerType === "office"
                    ? "border-emerald-500/30"
                    : "border-amber-500/30"
                )}
              />
            ) : (
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
            )}

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
                  ({t("reviews", { count: reviewCount })})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            {isBestValue && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                {t("bestValue")}
              </span>
            )}
            {providerType === "captain" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-emerald-400 border border-zinc-700 uppercase tracking-wider">
                {t("captain")}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 border-y border-zinc-800/60 py-3.5 my-1 text-center">
          <div className="flex flex-col items-center">
            <span className="text-blue-400 font-bold text-base">EGP {price}</span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">
              {t("price")}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-zinc-800/60">
            <span className="text-zinc-200 font-bold text-base">{displayDuration}</span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">
              {t("estimatedDelivery")}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "font-bold text-base",
                coverage === "insured" ? "text-emerald-400" : "text-zinc-500"
              )}
            >
              {coverage === "insured" ? t("insured") : t("none")}
            </span>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">
              {t("coverage")}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed min-h-[32px]">
          {displayDescription}
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        className={cn(
          "w-full mt-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 focus:outline-none",
          isSelected
            ? "bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20"
            : "bg-transparent text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100"
        )}
      >
        {isSelected ? t("selectThis") : t("select")}
      </button>
    </div>
  );
}
