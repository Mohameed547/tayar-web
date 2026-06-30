"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/shared/providers/socket-notification-provider";
import { DelixLogo } from "@/shared/ui/DelixLogo";
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
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { unreadCount } = useNotifications();

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
      badge: unreadCount,
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

  return (
    <aside
      className={cn(
        "flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800 text-zinc-400 p-4 shrink-0 justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DelixLogo className="h-7 w-7" textClassName="text-[19px] font-black tracking-tight text-white" />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1.5">
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

      {/* Footer / Copyright or secondary info */}
      <div className="px-3 text-xs text-zinc-600">
        <p>© 2026 Delix</p>
      </div>
    </aside>
  );
}
