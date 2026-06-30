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
    const fetchUser = () => {
      getCurrentUser()
        .then((data) => setUser(data))
        .catch((err) => console.error("Error fetching user in Topbar:", err));
    };

    fetchUser();

    window.addEventListener("profile-updated", fetchUser);
    return () => {
      window.removeEventListener("profile-updated", fetchUser);
    };
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
    <header className="flex items-center justify-between h-16 px-6 bg-[var(--dh-bg-topbar)] border-b border-[var(--dh-border)] text-[var(--dh-text-main)] gap-4">
      {/* Hamburger menu button for mobile */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] md:hidden transition-colors focus:outline-none shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Left side search trigger */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-dim)]" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-[var(--dh-bg-muted)] border border-[var(--dh-border)] rounded-xl pl-10 pr-4 py-1.5 text-sm text-[var(--dh-text-main)] placeholder-[var(--dh-text-dim)] focus:outline-none focus:border-[var(--dh-brand)] transition-colors"
          />
        </div>
      </div>

      {/* Right side notifications and profile */}
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle className="border-[var(--dh-border)] bg-[var(--dh-bg-muted)]" />
          <LocaleToggle className="border-[var(--dh-border)] bg-[var(--dh-bg-muted)]" />
        </div>
        {/* Notification bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative p-2 rounded-lg text-[var(--dh-text-sub)] hover:text-[var(--dh-text-main)] hover:bg-[var(--dh-bg-muted)] transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dh-danger)] text-[9px] font-black text-white ring-2 ring-[var(--dh-bg-topbar)]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-[var(--dh-border)]" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--dh-bg-muted)] transition-colors focus:outline-none"
          >
            {/* Avatar badge */}
            <div className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden bg-[var(--dh-brand)] text-white font-bold text-xs shrink-0">
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : user ? (
                getInitials(user.name)
              ) : (
                "..."
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-semibold leading-tight text-[var(--dh-text-main)]">
                {user ? user.name : "Loading..."}
              </span>
              <span className="text-[10px] text-[var(--dh-text-muted)]">
                {user ? getLocalizedRole(user.role) : "..."}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--dh-text-dim)] transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Overlay blocker to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl shadow-xl py-1 z-20">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--dh-text-sub)] hover:bg-[var(--dh-bg-muted)] hover:text-[var(--dh-text-main)] transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-[var(--dh-text-dim)]" />
                  <span>{t("myProfile")}</span>
                </Link>
                <Link
                  href="/profile?tab=settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--dh-text-sub)] hover:bg-[var(--dh-bg-muted)] hover:text-[var(--dh-text-main)] transition-colors"
                >
                  <Settings className="h-4 w-4 text-[var(--dh-text-dim)]" />
                  <span>{t("accountSettings")}</span>
                </Link>
                <hr className="border-[var(--dh-border)] my-1" />
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--dh-danger)] hover:bg-[var(--dh-bg-muted)] hover:text-[var(--dh-danger)]/80 transition-colors text-left"
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
