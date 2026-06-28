"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { tokenStorage } from "@/lib/auth/token-storage";
import { Bell, Truck, Check, Wallet, Info, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface SocketNotificationContextType {
  socket: Socket | null;
  unreadCount: number;
  decrementUnread: () => void;
  resetUnread: () => void;
  triggerLocalToast: (title: string, message: string, type?: string) => void;
}

const SocketNotificationContext = createContext<SocketNotificationContextType>({
  socket: null,
  unreadCount: 0,
  decrementUnread: () => {},
  resetUnread: () => {},
  triggerLocalToast: () => {},
});

export const useNotifications = () => useContext(SocketNotificationContext);

export function SocketNotificationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const prevTokenRef = useRef<string | null>(null);

  // Poll backend notifications count initially or on path change
  const fetchUnreadCount = async () => {
    const token = tokenStorage.getToken();
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        const list = result?.data || [];
        const unread = list.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [pathname]);

  useEffect(() => {
    const token = tokenStorage.getToken();
    if (token === prevTokenRef.current) return;
    prevTokenRef.current = token;

    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to Real-time Notification Socket");
    });

    newSocket.on("newNotification", (notif: any) => {
      console.log("Real-time Notification Received:", notif);
      setUnreadCount((prev) => prev + 1);

      // Play audio notification chime
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav");
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch {}

      // Trigger visual toast
      triggerLocalToast(notif.title, notif.message, notif.type);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Real-time Notification Socket");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [pathname]); // Check connection status on path transition

  const triggerLocalToast = (title: string, message: string, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const decrementUnread = () => setUnreadCount((prev) => Math.max(0, prev - 1));
  const resetUnread = () => setUnreadCount(0);

  const getIcon = (type: string) => {
    switch (type) {
      case "pickup":
      case "in_transit":
        return <Truck className="h-5 w-5 text-blue-400" />;
      case "offer_accepted":
      case "delivered":
        return <Check className="h-5 w-5 text-emerald-400" />;
      case "offer_received":
      case "received":
        return <Wallet className="h-5 w-5 text-amber-400" />;
      default:
        return <Bell className="h-5 w-5 text-purple-400" />;
    }
  };

  return (
    <SocketNotificationContext.Provider
      value={{
        socket,
        unreadCount,
        decrementUnread,
        resetUnread,
        triggerLocalToast,
      }}
    >
      {children}

      {/* Styled Toasts container */}
      <div
        className={`fixed z-50 flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none`}
        style={{
          top: "1rem",
          right: isRTL ? "auto" : "1rem",
          left: isRTL ? "1rem" : "auto",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 p-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl shadow-2xl pointer-events-auto transition-all duration-300 animate-slide-in"
            style={{
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-bold text-zinc-200">{toast.title}</span>
              <p className="text-xs text-zinc-400 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Keyframe animation declarations */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </SocketNotificationContext.Provider>
  );
}
