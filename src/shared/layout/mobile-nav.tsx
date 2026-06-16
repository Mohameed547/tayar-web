"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  MapPin,
  Wallet,
  Bell,
  Star,
  Headphones,
  Settings,
  Ship,
  X,
} from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const menuItems = [
    {
      label: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("newShipment"),
      href: "/shipments/new",
      icon: PlusCircle,
    },
    {
      label: t("myShipments"),
      href: "/shipments",
      icon: Package,
    },
    {
      label: t("track"),
      href: "/tracking",
      icon: MapPin,
    },
    {
      label: t("wallet"),
      href: "/wallet",
      icon: Wallet,
    },
    {
      label: t("notifications"),
      href: "/notifications",
      icon: Bell,
      badge: 3,
    },
    {
      label: t("reviews"),
      href: "/reviews",
      icon: Star,
    },
    {
      label: t("support"),
      href: "/support",
      icon: Headphones,
    },
    {
      label: t("settings"),
      href: "/profile",
      icon: Settings,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative flex flex-col w-64 max-w-xs h-full bg-zinc-950 border-r border-zinc-800 p-4 justify-between animate-in slide-in-from-left duration-200 z-10">
        <div className="flex flex-col gap-6">
          {/* Header section with close toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2 text-blue-500 font-bold text-xl">
              <Ship className="h-6 w-6 stroke-[2.5]" />
              <span>ShipConnect</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
              {t("menu")}
            </span>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:text-zinc-200 hover:bg-zinc-900 group",
                    isActive
                      ? "bg-blue-600/10 text-blue-500 hover:bg-blue-600/15 hover:text-blue-400"
                      : "text-zinc-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 group-hover:scale-105",
                        isActive ? "text-blue-500" : "text-zinc-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Info */}
        <div className="px-3 text-xs text-zinc-600">
          <p>© 2026 ShipConnect</p>
        </div>
      </div>
    </div>
  );
}
