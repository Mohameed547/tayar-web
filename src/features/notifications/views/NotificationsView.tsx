"use client";

import { useEffect, useState } from "react";
import { Truck, Check, Wallet, CheckCircle, Info } from "lucide-react";
import { Notification, NotificationType } from "../types";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { getNotifications, markAsRead, markAllAsRead } from "../api"; // عدّل المسار حسب مكان الملف عندك
import { useNotifications } from "@/shared/providers/socket-notification-provider";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setActiveScreen } from "@/features/captain/store/dashboard-slice";

interface ExtNotification extends Notification {
  captainName?: string;
  shipmentDate?: string;
  rawRelatedShipment?: any;
}

export default function NotificationsView() {
  const t = useTranslations("customer.notifications");
  const locale = useLocale();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { socket, unreadCount: socketUnread, decrementUnread, resetUnread } = useNotifications();

  const [notifications, setNotifications] = useState<ExtNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProviderDashboard = pathname.includes("captain-dashboard");

  const mapBackendTypeToFrontend = (type: string): NotificationType => {
    if (type === "picked_up" || type === "in_transit" || type === "captain_assigned") return "pickup";
    if (type === "offer_accepted") return "offer";
    if (type === "offers_received" || type === "offer_received" || type === "new_shipment") return "received";
    if (type === "delivered") return "delivered";
    return "info";
  };

  const formatNotification = (n: any): ExtNotification => {
    const shipmentObj = n.relatedShipment;
    
    return {
      id: n._id || n.id,
      title: n.title,
      message: n.message,
      time: new Date(n.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      }),
      type: mapBackendTypeToFrontend(n.type),
      isRead: n.isRead,
      shipmentId: typeof shipmentObj === 'object' && shipmentObj ? shipmentObj._id || shipmentObj.id : n.relatedShipment,
      captainName: typeof shipmentObj === 'object' && shipmentObj?.captain?.fullName ? shipmentObj.captain.fullName : undefined,
      shipmentDate: typeof shipmentObj === 'object' && shipmentObj?.createdAt
        ? new Date(shipmentObj.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : undefined,
      rawRelatedShipment: shipmentObj,
    };
  };

  const getTranslatedContent = (item: ExtNotification) => {
    const shipmentObj = item.rawRelatedShipment || {};
    const trackingNo = typeof shipmentObj === 'object' && shipmentObj ? shipmentObj.trackingNumber : undefined;
    const cleanTrackingNo = trackingNo || item.shipmentId || "";

    switch (item.type) {
      case "pickup":
        return {
          title: t("pickupTitle") || item.title,
          message: t("pickupMessage")
            ? t("pickupMessage")
                .replace("Karim M.", item.captainName || (locale === 'ar' ? 'كريم م.' : 'Karim M.'))
                .replace("كريم م.", item.captainName || (locale === 'ar' ? 'كريم م.' : 'Karim M.'))
                .replace("SC-00412", cleanTrackingNo)
            : item.message,
        };
      case "offer":
        return {
          title: t("acceptedTitle") || item.title,
          message: t("acceptedMessage")
            ? t("acceptedMessage")
                .replace("SC-00412", cleanTrackingNo)
            : item.message,
        };
      case "received": {
        const priceMatch = item.message.match(/EGP\s*(\d+)/i) || item.message.match(/(\d+)\s*EGP/i);
        const price = priceMatch ? priceMatch[1] : "";
        
        let providerName = "";
        const providerMatch = item.message.match(/^(.+?)\s+(?:sent|submitted|created)\s+/i);
        if (providerMatch && !item.message.toLowerCase().startsWith("you ")) {
          providerName = providerMatch[1];
        }

        const isOffer = item.message.toLowerCase().includes("offer");
        
        if (isOffer && price) {
          return {
            title: locale === 'ar' ? 'عرض جديد مقدم' : 'New Offer Received',
            message: locale === 'ar'
              ? (providerName 
                  ? `قدم ${providerName} عرضاً جديداً بقيمة ${price} ج.م للشحنة ${cleanTrackingNo}.`
                  : `لديك عرض جديد بقيمة ${price} ج.م للشحنة ${cleanTrackingNo}.`)
              : (providerName
                  ? `${providerName} sent a new offer of EGP ${price} for shipment ${cleanTrackingNo}.`
                  : `You received a new offer of EGP ${price} for shipment ${cleanTrackingNo}.`),
          };
        }

        return {
          title: t("receivedTitle") || item.title,
          message: t("receivedMessage")
            ? t("receivedMessage").replace("SC-00412", cleanTrackingNo)
            : item.message,
        };
      }
      case "delivered":
        return {
          title: t("deliveredTitle") || item.title,
          message: t("deliveredMessage")
            ? t("deliveredMessage")
                .replace("SC-00408", cleanTrackingNo)
            : item.message,
        };
      default:
        return {
          title: item.title,
          message: item.message,
        };
    }
  };

  // Real-time socket updates for Notifications page
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif: any) => {
      console.log("NotificationsView: Real-time notification received:", notif);
      const formatted = formatNotification(notif);
      setNotifications((prev) => [formatted, ...prev]);
    };

    socket.on("newNotification", handleNewNotification);
    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, locale]);

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      try {
        setIsLoading(true);
        setError(null);
        console.log("NotificationsView: Calling getNotifications...");
        const data = await getNotifications();
        console.log("NotificationsView: Received data:", data);
        if (isMounted) {
          const formatted = (data || []).map((n: any) => formatNotification(n));
          console.log("NotificationsView: Formatted notifications:", formatted);
          setNotifications(formatted);
        }
      } catch (err) {
        console.error("NotificationsView: Error in fetchNotifications:", err);
        if (isMounted) {
          setError(locale === 'ar' ? "حدث خطأ في تحميل الإشعارات، حاول مرة أخرى." : "Error loading notifications, please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const handleMarkRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    // optimistic update
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );

    decrementUnread();

    try {
      await markAsRead(id);
    } catch (err) {
      // rollback لو الطلب فشل
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: false } : notif,
        ),
      );
      // rollback global unread count
      // We can let the user's next action sync this or keep it optimistic.
    }
  };

  const handleMarkAllRead = async () => {
    const previous = notifications;

    // optimistic update
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );

    resetUnread();

    try {
      await markAllAsRead();
    } catch (err) {
      // rollback لو الطلب فشل
      setNotifications(previous);
      // rollback global unread count
      // We can let the user's next action sync this or keep it optimistic.
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleViewDetails = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkRead(item.id);

    if (isProviderDashboard) {
      e.preventDefault();
      // Navigate inside Captain/Office dashboard
      if (item.type === "received") {
        dispatch(setActiveScreen("requests"));
      } else {
        dispatch(setActiveScreen("orders"));
      }
    }
  };

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
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {t("newCount", { count: unreadCount })}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 focus:outline-none transition-colors"
          >
            {t("markAll")}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-[72px] animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-red-400 text-center py-8">{error}</p>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-8">
          لا توجد إشعارات حاليًا
        </p>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="flex flex-col gap-3">
          {notifications.map((item) => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;
            const { title, message } = getTranslatedContent(item);

            return (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                className={cn(
                  "bg-zinc-900 border border-zinc-800 border-l-0 rounded-r-xl p-4 flex gap-4 items-start shadow-sm transition-all cursor-pointer",
                  config.borderColor,
                  item.isRead
                    ? "opacity-65 hover:bg-zinc-900/60"
                    : "hover:bg-zinc-900/80 hover:border-zinc-750",
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg border shrink-0",
                    config.iconColor,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className="flex justify-between items-baseline gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-200">
                        {title}
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
                    {message}
                  </p>

                  {(item.captainName || item.shipmentDate) && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400 font-medium">
                      {item.captainName && (
                        <div>
                          <span className="text-zinc-500">{locale === 'ar' ? 'الكابتن:' : 'Captain:'}</span>{' '}
                          <span className="text-blue-400 font-bold">{item.captainName}</span>
                        </div>
                      )}
                      {item.shipmentDate && (
                        <div>
                          <span className="text-zinc-500">{locale === 'ar' ? 'تاريخ الشحن:' : 'Date:'}</span>{' '}
                          <span className="text-zinc-300 font-bold">{item.shipmentDate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {item.shipmentId && (
                    <div className="mt-3 flex items-center">
                      <Link
                        href={`/tracking/${item.shipmentId}`}
                        onClick={(e) => handleViewDetails(item, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-blue-400 hover:bg-zinc-750 hover:text-blue-300 transition-all border border-zinc-700/80"
                      >
                        <span>{locale === 'ar' ? 'عرض تفاصيل الشحنة ←' : 'View Shipment Details →'}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
