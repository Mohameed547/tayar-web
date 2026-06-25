"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  colorClass?: string;
  iconColorClass?: string;
  href?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  colorClass = "text-[var(--dh-text-main)]",
  iconColorClass = "text-[var(--dh-text-sub)] bg-[var(--dh-bg-app)] border-[var(--dh-border)]",
  href,
  className,
}: StatCardProps) {
  const CardContent = (
    <div
      className={cn(
        "bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-300",
        href && "hover:border-[var(--dh-border-brand)] cursor-pointer hover:opacity-90 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[var(--dh-text-sub)] uppercase tracking-wider">
            {title}
          </span>
          <p className={cn("text-3xl font-extrabold tracking-tight mt-0.5", colorClass)}>
            {value}
          </p>
        </div>

        {Icon && (
          <div className={cn("p-2 rounded-lg border", iconColorClass)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {description && (
        <span className="text-[10px] text-[var(--dh-text-sub)] font-semibold mt-2.5">
          {description}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
