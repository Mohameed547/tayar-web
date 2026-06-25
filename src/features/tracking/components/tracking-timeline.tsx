"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { TrackingMilestone } from "@/features/tracking/types";

interface TrackingTimelineProps {
  milestones: TrackingMilestone[];
}

const titleKeys = {
  1: "shipmentCreated",
  2: "offerAccepted",
  3: "packagePickedUp",
  4: "inTransit",
  5: "outForDelivery",
  6: "delivered",
} as const;

export default function TrackingTimeline({ milestones }: TrackingTimelineProps) {
  const t = useTranslations("customer.tracking");

  return (
    <div className="flex flex-col gap-6 relative pl-3.5 mt-2">
      <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-zinc-800" />

      {milestones.map((milestone) => {
        const { step, timestamp, status } = milestone;
        const isCompleted = status === "completed";
        const isActive = status === "active";
        const titleKey = titleKeys[step as keyof typeof titleKeys] ?? "shipmentCreated";

        return (
          <div key={step} className="flex gap-4 relative items-start group">
            <div className="relative z-10 flex items-center justify-center shrink-0">
              {isCompleted ? (
                <div className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-zinc-900 border-2 border-zinc-950">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              ) : isActive ? (
                <div className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-500 border-2 border-zinc-950 shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-4 w-4 rounded-full bg-zinc-800 border-2 border-zinc-950">
                  <span className="text-[9px] font-bold text-zinc-500">{step}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5 leading-tight">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold transition-colors duration-200",
                    isCompleted
                      ? "text-zinc-300"
                      : isActive
                        ? "text-blue-400 font-bold"
                        : "text-zinc-500"
                  )}
                >
                  {t(titleKey)}
                </span>
                {timestamp && (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {isActive ? t("now") : timestamp}
                  </span>
                )}
              </div>
              {isActive && (
                <p className="text-xs mt-0.5 leading-normal text-blue-400 font-medium animate-pulse">
                  {t("progress", { progress: 65 })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
