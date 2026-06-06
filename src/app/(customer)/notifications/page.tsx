"use client";

import { useState } from "react";
import { Truck, Check, Wallet, CheckCircle, Info } from "lucide-react";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  // Mock data as state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "nt-1",
      title: "Package picked up!",
      message: "SC-00412 picked up by Karim M.",
      time: "2 min ago",
      type: "pickup",
      isRead: false,
      shipmentId: "sc-00412",
    },
    {
      id: "nt-2",
      title: "Offer accepted!",
      message: "You selected Nour Logistics for SC-00412",
      time: "35 min ago",
      type: "offer",
      isRead: false,
      shipmentId: "sc-00412",
    },
    {
      id: "nt-3",
      title: "4 offers received",
      message: "Compare and select for SC-00412",
      time: "1h ago",
      type: "received",
      isRead: false,
      shipmentId: "sc-00412",
    },
    {
      id: "nt-4",
      title: "Delivered ✔",
      message: "SC-00408 delivered successfully",
      time: "Yesterday",
      type: "delivered",
      isRead: true,
      shipmentId: "sc-00408",
    },
  ]);

  // Mark a single notification as read
  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  // Unread badge count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Helper to get styling config based on type
  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case "pickup":
        return {
          icon: Truck,
          borderColor: "border-l-4 border-l-blue-500",
          iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        };
      case "offer":
        return {
          icon: Check,
          borderColor: "border-l-4 border-l-emerald-500",
          iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "received":
        return {
          icon: Wallet,
          borderColor: "border-l-4 border-l-amber-500",
          iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "delivered":
        return {
          icon: CheckCircle,
          borderColor: "border-l-4 border-l-zinc-700",
          iconColor: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
        };
      default:
        return {
          icon: Info,
          borderColor: "border-l-4 border-l-zinc-700",
          iconColor: "text-zinc-400 bg-zinc-800 border-zinc-700",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-2xl mx-auto">
      {/* Header section with unread badge counter */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 focus:outline-none transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {notifications.map((item) => {
          const config = getTypeConfig(item.type);
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id)}
              className={cn(
                "bg-zinc-900 border border-zinc-800 border-l-0 rounded-r-xl p-4 flex gap-4 items-start shadow-sm transition-all cursor-pointer",
                config.borderColor,
                item.isRead ? "opacity-65 hover:bg-zinc-900/60" : "hover:bg-zinc-900/80 hover:border-zinc-750"
              )}
            >
              <div className={cn("p-2.5 rounded-lg border shrink-0", config.iconColor)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-200">
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
