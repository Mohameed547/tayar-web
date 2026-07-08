"use client";

import { 
  PackagePlus, 
  Handshake, 
  Package, 
  Truck, 
  MapPin, 
  KeyRound, 
  Camera, 
  Coins, 
  Star,
  Check
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { TrackingMilestone } from "@/features/tracking/types";

interface TrackingTimelineProps {
  milestones: TrackingMilestone[];
  progressPercent?: number;
  onMilestoneClick?: (step: number) => void;
}

const stepIcons = {
  1: PackagePlus,
  2: Handshake,
  3: Package,
  4: Truck,
  5: MapPin,
  6: KeyRound,
  7: Camera,
  8: Coins,
  9: Star,
} as const;

export default function TrackingTimeline({ milestones, progressPercent = 0, onMilestoneClick }: TrackingTimelineProps) {
  return (
    <div className="flex flex-col gap-5 mt-2">
      {milestones.map((milestone, index) => {
        const { step, title, timestamp, status, description } = milestone;
        const isCompleted = status === "completed";
        const isActive = status === "active";
        const IconComponent = stepIcons[step as keyof typeof stepIcons] || Package;

        const isLast = index === milestones.length - 1;
        const nextMilestone = isLast ? null : milestones[index + 1];
        const isLineCompleted = isCompleted && (nextMilestone?.status === 'completed' || nextMilestone?.status === 'active');
        const isClickable = step === 9 && isActive;

        return (
          <div 
            key={step} 
            onClick={() => isClickable && onMilestoneClick?.(step)}
            className={cn(
              "flex gap-4 relative items-start group transition-all duration-300 p-1.5 -mx-1.5 rounded-lg border border-transparent",
              isClickable ? "cursor-pointer hover:bg-zinc-800/30 hover:border-zinc-850/50" : ""
            )}
          >
            <div className="relative z-10 flex items-center justify-center shrink-0 flex-col">
              {isCompleted ? (
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all duration-300">
                  <IconComponent className="h-3 w-3 stroke-[2.5]" />
                </div>
              ) : isActive ? (
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-zinc-900 border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)] animate-pulse transition-all duration-300">
                  <IconComponent className="h-3 w-3 stroke-[2.5]" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-900 text-zinc-600 border border-zinc-850 transition-all duration-300">
                  <IconComponent className="h-3 w-3 stroke-[2]" />
                </div>
              )}

              {!isLast && (
                <div 
                  className={cn(
                    "w-0.5 absolute top-[28px] bottom-0 -mb-[28px]",
                    isLineCompleted ? "bg-emerald-500" : "bg-zinc-800"
                  )}
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
            </div>

            <div className="flex flex-col gap-0.5 leading-tight flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold transition-colors duration-200",
                    isCompleted
                      ? "text-zinc-300"
                      : isActive
                        ? "text-blue-400 font-bold"
                        : "text-zinc-500"
                  )}
                >
                  {title}
                </span>
                {timestamp && (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {timestamp}
                  </span>
                )}
              </div>
              
              {description && (
                <span className={cn(
                  "text-[10px] leading-relaxed transition-colors duration-200 mt-0.5",
                  isActive ? "text-blue-400/80 font-medium" : "text-zinc-500"
                )}>
                  {description}
                </span>
              )}

              {isActive && step === 4 && progressPercent > 0 && (
                <div className="w-full bg-zinc-950 rounded-full h-1 mt-1.5 overflow-hidden border border-zinc-850">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
