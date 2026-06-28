"use client";

import { Bell, Search, ChevronDown, User as UserIcon, LogOut, Settings, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleToggle } from "@/shared/ui/locale-toggle";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/features/auth/api";
import { useNotifications } from "@/shared/providers/socket-notification-provider";
import type { User } from "@/features/auth/types";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { unreadCount } = useNotifications();
  const t = useTranslations("navigation");
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user in Topbar:", err));
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getLocalizedRole = (role: string) => {
    if (role === "customer") return t("customer") || "Customer";
    if (role === "driver") return "Captain";
    if (role === "office") return "Office";
    return role;
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-zinc-950 border-b border-zinc-800 text-zinc-100 gap-4">
      {/* Hamburger menu button for mobile */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 md:hidden transition-colors focus:outline-none shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Left side search trigger */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Right side notifications and profile */}
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle className="border-zinc-800 bg-zinc-900 dark:bg-zinc-900" />
          <LocaleToggle className="border-zinc-800 bg-zinc-900 dark:bg-zinc-900" />
        </div>
        {/* Notification bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-zinc-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-zinc-800" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors focus:outline-none"
          >
            {/* Avatar badge */}
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
              {user ? getInitials(user.name) : "..."}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-semibold leading-tight text-zinc-200">
                {user ? user.name : "Loading..."}
              </span>
              <span className="text-[10px] text-zinc-500">
                {user ? getLocalizedRole(user.role) : "..."}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Overlay blocker to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-20">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                  <span>{t("myProfile")}</span>
                </Link>
                <Link
                  href="/profile?tab=settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span>{t("accountSettings")}</span>
                </Link>
                <hr className="border-zinc-800 my-1" />
                <button
                  onClick={async () => {
                    setDropdownOpen(false);
                    try {
                      await logout();
                    } catch (e) {
                      console.error("Sign out error:", e);
                    }
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("signOut")}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
