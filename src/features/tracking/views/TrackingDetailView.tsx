"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Package, 
  Navigation,
  ShieldAlert,
  KeyRound,
  Coins,
  DollarSign,
  CheckCircle2,
  Wallet,
  ExternalLink,
  Lock,
  AlertCircle,
  MapPin,
  Signal,
  RefreshCw,
  Clock,
  Compass,
  Copy,
  Star,
  Camera
} from "lucide-react";
import { mockShipments, mockOffers } from "@/constants/mock-data";
import TrackingTimeline from "../components/tracking-timeline";
import { useTranslations, useLocale } from "next-intl";
import { getShipmentById } from "@/features/shipments/api";
import { generateOTP } from "@/features/shipments/api/captain-api";
import { getOffersForShipment } from "@/features/offers/api";
import { ReviewModal } from "@/features/reviews";
import { getTrackingDetails } from "@/features/tracking/api";
import { getWallet } from "@/features/wallet/api";
import type { Shipment } from "@/features/shipments/types";
import type { Offer } from "@/features/offers/types";
import type { TrackingMilestone } from "../types";
import type { Wallet as UserWallet } from "@/features/wallet/types";
import { useAppDispatch } from "@/store/hooks";
import { fetchCustomerDashboard } from "@/store/customer-slice";
import { useShipmentTracking, useNotificationsListener, useSocketEvent, useSocket } from "@/shared/socket";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full bg-zinc-950 flex items-center justify-center text-xs text-zinc-500 font-semibold border border-zinc-800 rounded-xl">
      Loading Live Tracking Map...
    </div>
  ),
});

const getDistance = (coords1?: [number, number], coords2?: [number, number]) => {
  if (!coords1 || !coords2) return null;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in km
};

interface TrackingDetailViewProps {
  id: string;
  offerId: string | null;
}

const statusDescriptions = {
  en: {
    pending_offers: "Awaiting offers from captains",
    captain_assignment: "Assigning a captain",
    picked_up: "Package picked up by captain",
    in_transit: "Captain is heading to destination",
    out_for_delivery: "Captain is delivering the package",
    delivered: "Shipment delivered successfully",
    cancelled: "Shipment cancelled",
  },
  ar: {
    pending_offers: "في انتظار عروض الكباتن",
    captain_assignment: "جاري تعيين كابتن للطلب",
    picked_up: "تم استلام الشحنة بواسطة الكابتن",
    in_transit: "الكابتن في طريقه إلى الوجهة",
    out_for_delivery: "خرجت الشحنة للتسليم النهائي",
    delivered: "تم توصيل الشحنة بنجاح",
    cancelled: "تم إلغاء الشحنة",
  }
};

export default function TrackingDetailView({ id, offerId }: TrackingDetailViewProps) {
  const t = useTranslations("customer.tracking");
  const locale = useLocale();
  const dispatch = useAppDispatch();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captainCoords, setCaptainCoords] = useState<[number, number] | undefined>(undefined);
  const [trackingDetails, setTrackingDetails] = useState<any>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>(Date.now());
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState(0);
  const [otpTimeLeft, setOtpTimeLeft] = useState<string>("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { socket } = useSocket();
  const [captainOnline, setCaptainOnline] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const lastLocationUpdateRef = useRef<number>(0);
  const lastCoordRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  const captain = shipment?.captain as any;

  const handleRegenerateOTP = async () => {
    if (!shipment?.id) return;
    setOtpLoading(true);
    try {
      const res = await generateOTP(shipment.id);
      if (res?.data?.otpCode) {
        setOtpExpiresAt(res.data.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString());
        setShipment(prev => {
          if (!prev) return null;
          return {
            ...prev,
            proofOfDelivery: {
              otpCode: res.data.otpCode,
              recipientName: prev.proofOfDelivery?.recipientName ?? null,
              signatureImage: prev.proofOfDelivery?.signatureImage ?? null,
              packageImage: prev.proofOfDelivery?.packageImage ?? null,
              verifiedAt: prev.proofOfDelivery?.verifiedAt ?? null,
            }
          };
        });
      }
    } catch (err) {
      console.error("Failed to generate new OTP:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  const refreshTrackingData = async () => {
    if (!id) return;
    try {
      const [loadedShipment, loadedOffers, loadedWallet, loadedTracking] = await Promise.all([
        getShipmentById(id).catch(() => null),
        getOffersForShipment(id).catch(() => []),
        getWallet().catch(() => null),
        getTrackingDetails(id).catch(() => null)
      ]);

      if (loadedShipment) {
        setShipment(loadedShipment);
        setOffers(loadedOffers);
        if (loadedShipment.proofOfDelivery?.otpCode && !loadedShipment.proofOfDelivery?.verifiedAt) {
          setOtpExpiresAt(new Date(Date.now() + 10 * 60 * 1000).toISOString());
        }
      }
      if (loadedWallet) {
        setWallet(loadedWallet);
      }
      if (loadedTracking) {
        setTrackingDetails(loadedTracking);
        if (loadedTracking.currentLocation?.coords) {
          const [lng, lat] = loadedTracking.currentLocation.coords;
          if (!isNaN(lat) && !isNaN(lng)) {
            setCaptainCoords([lat, lng]);
            setLastUpdatedTime(Date.now());
          }
        }
      }
      // Also update customer dashboard Redux state in the background
      dispatch(fetchCustomerDashboard());
    } catch (err) {
      console.error("Failed to refresh tracking data:", err);
    }
  };

  useEffect(() => {
    Promise.all([
      getShipmentById(id).catch((err) => {
        console.error("Failed to fetch shipment details, checking mock fallback:", err);
        const mock = mockShipments.find(
          (s) =>
            s.id.toLowerCase() === id.toLowerCase() ||
            s.trackingNumber.toLowerCase() === id.toLowerCase()
        );
        if (mock) return mock;
        setError(t("notFound") || "Shipment not found");
        return null;
      }),
      getOffersForShipment(id).catch((err) => {
        console.error("Failed to fetch offers, using mock fallback:", err);
        return mockOffers;
      }),
      getWallet().catch((err) => {
        console.error("Failed to fetch wallet info:", err);
        return null;
      }),
      getTrackingDetails(id).catch((err) => {
        console.error("Failed to fetch initial tracking details:", err);
        return null;
      })
    ]).then(([loadedShipment, loadedOffers, loadedWallet, loadedTracking]) => {
      if (loadedShipment) {
        setShipment(loadedShipment);
        setOffers(loadedOffers);
        if (loadedShipment.proofOfDelivery?.otpCode && !loadedShipment.proofOfDelivery?.verifiedAt) {
          setOtpExpiresAt(new Date(Date.now() + 10 * 60 * 1000).toISOString());
        }
      }
      if (loadedWallet) {
        setWallet(loadedWallet);
      }
      if (loadedTracking) {
        setTrackingDetails(loadedTracking);
        if (loadedTracking.currentLocation?.coords) {
          const [lng, lat] = loadedTracking.currentLocation.coords;
          if (!isNaN(lat) && !isNaN(lng)) {
            setCaptainCoords([lat, lng]);
          }
        }
      }
      setLoading(false);
    });
  }, [id]);

  // Check captain online status initially when captain info becomes available
  useEffect(() => {
    if (!socket || !captain) return;
    const captainId = captain._id || captain.id;
    if (!captainId) return;

    socket.emit("checkUserStatus", captainId, (res: { status: string }) => {
      if (res && res.status) {
        setCaptainOnline(res.status === "online");
      }
    });
  }, [socket, captain]);

  // Listen to user status changes to update captain online/offline status in real-time
  useSocketEvent<{ userId: string; status: "online" | "offline" }>(
    "user:statusChanged",
    (data) => {
      if (captain) {
        const captainId = captain._id || captain.id;
        if (captainId === data.userId) {
          setCaptainOnline(data.status === "online");
        }
      }
    },
    [captain]
  );

  // Listen to shipment:updated for instant database mutations (status, otp verification, timeline, payment)
  useSocketEvent<any>(
    "shipment:updated",
    (updatedShipment) => {
      if (updatedShipment && (updatedShipment._id === id || updatedShipment.id === id)) {
        setShipment((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...updatedShipment,
            status: updatedShipment.status as any,
            id: updatedShipment.id || updatedShipment._id,
          } as any;
        });
        if (updatedShipment.proofOfDelivery?.otpCode) {
          if (updatedShipment.proofOfDelivery.verifiedAt) {
            setOtpExpiresAt(null);
          }
        }
        // Background refresh to guarantee full Redux/API sync
        refreshTrackingData();
      }
    },
    [id]
  );

  // Real-time tracking using centralized useShipmentTracking hook
  useShipmentTracking(shipment?.id, {
    onLocationUpdate: (data) => {
      if (!data.coords || data.coords.length < 2) return;
      const [lng, lat] = data.coords;
      if (isNaN(lat) || isNaN(lng)) return;

      const now = Date.now();

      // Calculate current speed based on coordinate delta (KM / Hours)
      if (lastCoordRef.current) {
        const dist = getDistance([lastCoordRef.current.lat, lastCoordRef.current.lng], [lat, lng]);
        const timeDiffHours = (now - lastCoordRef.current.time) / (1000 * 60 * 60);
        if (timeDiffHours > 0 && dist !== null) {
          const speed = dist / timeDiffHours;
          if (speed >= 0 && speed <= 150) {
            // Smooth speed updates using Exponential Moving Average
            setCurrentSpeed(prev => prev !== null ? Math.round(prev * 0.7 + speed * 0.3) : Math.round(speed));
          }
        }
      }
      lastCoordRef.current = { lat, lng, time: now };

      // Throttle setting state to avoid excessive React render cycles (at most once per 1.2s)
      if (now - lastLocationUpdateRef.current >= 1200) {
        setCaptainCoords([lat, lng]);
        setLastUpdatedTime(now);
        lastLocationUpdateRef.current = now;

        setShipment((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            deliveryProgressPercent: data.progressPercent,
          } as any;
        });

        setTrackingDetails((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            progressPercent: data.progressPercent,
            currentLocation: {
              ...prev.currentLocation,
              coords: data.coords,
              updatedAt: data.updatedAt,
            },
          };
        });
      }
    },
    onStatusUpdate: (data) => {
      setShipment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: data.status as any,
        } as any;
      });
      refreshTrackingData();
    },
    onError: (err) => {
      console.error("Shipment tracking socket error:", err.message);
    }
  });

  // Re-fetch all data on notifications or wallet updates
  useNotificationsListener(() => {
    refreshTrackingData();
  });

  useSocketEvent("walletUpdate", () => {
    refreshTrackingData();
  });

  // Timer effect for last GPS update
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceLastUpdate(Math.floor((Date.now() - lastUpdatedTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  // Timer effect for OTP countdown
  useEffect(() => {
    if (!otpExpiresAt) {
      setOtpTimeLeft("");
      return;
    }
    
    const interval = setInterval(() => {
      const expiry = new Date(otpExpiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        setOtpTimeLeft(locale === 'ar' ? 'منتهي الصلاحية' : 'Expired');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setOtpTimeLeft(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold">
        <span>{t("loading") || "Loading tracking details..."}</span>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 text-sm font-semibold gap-4">
        <span>{error || t("notFound") || "Shipment not found"}</span>
        <Link
          href="/tracking"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
        >
          {locale === "ar" ? "العودة للتتبع" : "Back to Tracking"}
        </Link>
      </div>
    );
  }

  if (shipment.status === 'cancelled') {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto p-4">
        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center shadow-lg gap-6">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
              {locale === "ar" ? "تم إلغاء الشحنة" : "Shipment Cancelled"}
            </h1>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              {locale === "ar" 
                ? "لقد تم إلغاء هذه الشحنة بواسطة المسؤول أو النظام. تم إرجاع المبالغ المحتجزة بالكامل إلى محفظتك." 
                : "This shipment has been cancelled by the admin or the system. Any locked funds have been fully refunded to your wallet."}
            </p>
          </div>

          <div className={cn(
            "w-full bg-zinc-950/60 border border-zinc-850 p-4.5 rounded-xl flex flex-col gap-3 text-xs",
            locale === "ar" ? "text-right" : "text-left"
          )}>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500 font-semibold">{locale === "ar" ? "رقم التتبع" : "Tracking Number"}</span>
              <span className="font-mono font-bold text-zinc-300">{shipment.trackingNumber}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-semibold">{locale === "ar" ? "نقطة الاستلام" : "Pickup Location"}</span>
              <span className="text-zinc-300">{shipment.pickupAddress}</span>
            </div>
            <div className="flex flex-col gap-1 border-t border-zinc-900/60 pt-2">
              <span className="text-zinc-500 font-semibold">{locale === "ar" ? "نقطة التسليم" : "Delivery Location"}</span>
              <span className="text-zinc-300">{shipment.deliveryAddress}</span>
            </div>
            {shipment.price && (
              <div className="flex justify-between items-center border-t border-zinc-900/60 pt-2">
                <span className="text-zinc-500 font-semibold">{locale === "ar" ? "المبلغ المسترد" : "Refunded Amount"}</span>
                <span className="font-bold text-emerald-400">EGP {shipment.price.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
            <Link
              href="/dashboard"
              className="flex-1 max-w-xs px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white text-xs font-bold rounded-xl transition-all shadow-md text-center border border-zinc-700"
            >
              {locale === "ar" ? "العودة للرئيسية" : "Go to Dashboard"}
            </Link>
            <Link
              href="/shipments/new"
              className="flex-1 max-w-xs px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md text-center"
            >
              {locale === "ar" ? "طلب شحنة جديدة" : "Request New Shipment"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedOffer = offers.find((o) => o.id === offerId);
  const displayProvider = captain
    ? {
        name: captain.fullName || captain.name || "Captain",
        rating: captain.rating !== undefined ? captain.rating : 5.0,
        avatarUrl:
          (captain.profileImage || captain.avatar) &&
          ((captain.profileImage || captain.avatar).startsWith("http") ||
            (captain.profileImage || captain.avatar).startsWith("/") ||
            (captain.profileImage || captain.avatar).startsWith("data:"))
            ? (captain.profileImage || captain.avatar)
            : null,
        initials: (captain.fullName || captain.name || "Captain")
          ? (captain.fullName || captain.name || "Captain")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "?",
        role: t("captain"),
        phone: captain.phone,
      }
    : selectedOffer
    ? {
        name: selectedOffer.providerName,
        rating: selectedOffer.providerRating,
        avatarUrl:
          selectedOffer.providerAvatar &&
          (selectedOffer.providerAvatar.startsWith("http") ||
            selectedOffer.providerAvatar.startsWith("/") ||
            selectedOffer.providerAvatar.startsWith("data:"))
            ? selectedOffer.providerAvatar
            : null,
        initials: selectedOffer.providerName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        role: selectedOffer.providerType === "office" ? t("office") : t("captain"),
        phone: undefined,
      }
    : null;

  const formatMilestoneTime = (timestamp?: string) => {
    if (!timestamp) return undefined;
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    }) + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMilestoneTime = (status: string, fallbackText?: string) => {
    if (!trackingDetails?.milestones) return fallbackText;
    const milestone = trackingDetails.milestones.find((m: any) => m.status === status);
    return milestone ? formatMilestoneTime(milestone.timestamp) : fallbackText;
  };

  const parseCoords = (coords?: [number, number]): [number, number] | undefined => {
    if (!coords || coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) return undefined;
    return [coords[1], coords[0]];
  };

  const parsedPickup = parseCoords(shipment.pickupCoords);
  const parsedDelivery = parseCoords(shipment.deliveryCoords);

  const liveRemainingKm = getDistance(captainCoords, parsedDelivery);

  const computedEtaText = (() => {
    if (shipment.status === "delivered") {
      return locale === "ar" ? "وصلت الشحنة" : "Arrived";
    }
    if (liveRemainingKm !== null && liveRemainingKm > 0) {
      const activeSpeed = currentSpeed || 35; // fallback to 35 km/h
      const timeHours = liveRemainingKm / activeSpeed;
      const timeMinutes = Math.round(timeHours * 60);
      if (timeMinutes < 1) {
        return locale === "ar" ? "أقل من دقيقة" : "Less than a min";
      }
      if (timeMinutes < 60) {
        return locale === "ar" ? `${timeMinutes} دقيقة` : `${timeMinutes} mins`;
      }
      const hours = Math.floor(timeMinutes / 60);
      const mins = timeMinutes % 60;
      return locale === "ar"
        ? `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`
        : `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }

    if (shipment.etaDescription) return shipment.etaDescription;

    const distance = shipment.distanceKm || 0;
    const speed = shipment.deliverySpeed || "standard";
    if (speed === "scheduled") {
      return locale === "ar" ? "حسب الموعد المحدّد" : "As scheduled";
    }
    if (speed === "express") {
      if (distance < 50) return locale === "ar" ? "ساعة إلى ساعتين" : "1–2 hours";
      if (distance < 150) return locale === "ar" ? "ساعتان إلى 3 ساعات" : "2–3 hours";
      if (distance < 300) return locale === "ar" ? "4 إلى 5 ساعات" : "4–5 hours";
      return locale === "ar" ? "6 إلى 8 ساعات" : "6–8 hours";
    } else {
      if (distance < 50) return locale === "ar" ? "3 إلى 4 ساعات" : "3–4 hours";
      if (distance < 150) return locale === "ar" ? "5 إلى 6 ساعات" : "5–6 hours";
      if (distance < 300) return locale === "ar" ? "يوم واحد" : "1 day";
      return locale === "ar" ? "يومين" : "2 days";
    }
  })();

  const getTimelineMilestoneStatus = (step: number, currentStatus: string, proof: any): "completed" | "active" | "pending" => {
    switch (step) {
      case 1:
        return "completed";
      case 2:
        if (currentStatus === "pending_offers") return "pending";
        if (currentStatus === "captain_assignment") return "active";
        return "completed";
      case 3:
        if (["pending_offers", "captain_assignment"].includes(currentStatus)) return "pending";
        if (currentStatus === "picked_up") return "active";
        return "completed";
      case 4:
        if (["pending_offers", "captain_assignment", "picked_up"].includes(currentStatus)) return "pending";
        if (currentStatus === "in_transit") return "active";
        return "completed";
      case 5:
        if (["pending_offers", "captain_assignment", "picked_up", "in_transit"].includes(currentStatus)) return "pending";
        if (currentStatus === "out_for_delivery" && !proof?.verifiedAt) return "active";
        return "completed";
      case 6:
        if (["pending_offers", "captain_assignment", "picked_up", "in_transit"].includes(currentStatus)) return "pending";
        if (currentStatus === "out_for_delivery") {
          return proof?.verifiedAt ? "completed" : "active";
        }
        return "completed";
      case 7:
        if (currentStatus !== "out_for_delivery" && currentStatus !== "delivered") return "pending";
        if (currentStatus === "out_for_delivery") {
          if (!proof?.verifiedAt) return "pending";
          return proof?.packageImage ? "completed" : "active";
        }
        return "completed";
      case 8:
        if (currentStatus === "delivered") return "completed";
        return "pending";
      case 9:
        if (currentStatus === "delivered") return "active";
        return "pending";
      default:
        return "pending";
    }
  };

  const getMilestoneDescription = (step: number, currentStatus: string, proof: any): string | undefined => {
    if (locale === "ar") {
      switch (step) {
        case 1: return "تم تسجيل الشحنة بنجاح على نظام طيار.";
        case 2: return "تم اختيار الكابتن المناسب وتأكيد العرض المالي.";
        case 3: return "استلم الكابتن الطرد من موقع الاستلام المحدد.";
        case 4: return "الكابتن في طريقه للوجهة لتسليم طردك.";
        case 5: return "وصل الكابتن إلى نطاق موقع التسليم.";
        case 6: return proof?.verifiedAt ? "تم إدخال الرمز السري وتأكيد الهوية." : "يرجى تزويد الكابتن برقم الـ OTP لتأكيد الاستلام.";
        case 7: return proof?.packageImage ? "تم رفع صورة الطرد كإثبات للتوصيل." : "بانتظار قيام الكابتن برفع صورة الطرد لتأكيد سلامته.";
        case 8: return currentStatus === "delivered" ? "تم الإفراج عن المبلغ وتحويله للمحفظة." : "سيتم الإفراج عن الأموال فور التحقق.";
        case 9: return currentStatus === "delivered" ? "شاركنا رأيك في الخدمة وتقييم الكابتن." : "التقييم سيكون متاحاً فور اكتمال التوصيل.";
        default: return undefined;
      }
    } else {
      switch (step) {
        case 1: return "Shipment registered successfully on Tayar.";
        case 2: return "Captain selected and delivery offer accepted.";
        case 3: return "Package has been picked up from sender.";
        case 4: return "Captain is on the way to the delivery location.";
        case 5: return "Captain has arrived at the destination area.";
        case 6: return proof?.verifiedAt ? "Verification code entered and verified." : "Please provide the OTP code to the captain.";
        case 7: return proof?.packageImage ? "Package photo uploaded successfully." : "Awaiting captain photo upload to verify package integrity.";
        case 8: return currentStatus === "delivered" ? "Funds released successfully from escrow." : "Funds will be released upon delivery.";
        case 9: return currentStatus === "delivered" ? "Please rate your experience with this delivery." : "Review will be available after delivery.";
        default: return undefined;
      }
    }
  };

  const getCurrentActionMessage = (status: string, proof: any) => {
    if (locale === 'ar') {
      switch (status) {
        case 'pending_offers': return 'بانتظار تلقي عروض الأسعار من الكباتن...';
        case 'captain_assignment': return 'بانتظار قبول الكابتن للطلب والبدء...';
        case 'picked_up': return 'الكابتن استلم الشحنة ويستعد للانطلاق...';
        case 'in_transit': return 'الكابتن في طريقه للتسليم حالياً...';
        case 'out_for_delivery': 
          if (proof?.verifiedAt) {
            return 'تم التحقق من الرمز، بانتظار التقاط صورة التسليم...';
          }
          return 'بانتظار إدخال رمز التحقق (OTP) للتوصيل...';
        case 'delivered': return 'تم توصيل الشحنة بنجاح وتحرير المدفوعات!';
        case 'cancelled': return 'تم إلغاء الشحنة.';
        default: return 'جاري المعالجة...';
      }
    } else {
      switch (status) {
        case 'pending_offers': return 'Waiting for captains to submit offers...';
        case 'captain_assignment': return 'Waiting for captain to accept assignment...';
        case 'picked_up': return 'Captain has picked up the package. Preparing transit...';
        case 'in_transit': return 'Captain is currently in transit to your destination...';
        case 'out_for_delivery':
          if (proof?.verifiedAt) {
            return 'OTP verified. Waiting for package photo upload...';
          }
          return 'Waiting for Delivery verification OTP...';
        case 'delivered': return 'Shipment delivered successfully. Escrow funds released!';
        case 'cancelled': return 'Shipment has been cancelled.';
        default: return 'Processing shipment...';
      }
    }
  };

  const milestones: TrackingMilestone[] = [
    {
      step: 1,
      title: locale === 'ar' ? 'إنشاء الشحنة' : 'Shipment Created',
      timestamp: shipment.createdAt ? formatMilestoneTime(shipment.createdAt) : "Just now",
      status: getTimelineMilestoneStatus(1, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(1, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 2,
      title: locale === 'ar' ? 'قبول العرض' : 'Offer Accepted',
      timestamp: getMilestoneTime("assigned", shipment.status !== "pending_offers" ? formatMilestoneTime(shipment.createdAt) : undefined),
      status: getTimelineMilestoneStatus(2, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(2, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 3,
      title: locale === 'ar' ? 'استلام الطرد' : 'Package Picked Up',
      timestamp: getMilestoneTime("picked_up", ["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(shipment.status) ? "Completed" : undefined),
      status: getTimelineMilestoneStatus(3, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(3, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 4,
      title: locale === 'ar' ? 'بدء التوصيل' : 'Captain Started Delivery',
      timestamp: getMilestoneTime("in_transit", ["in_transit", "out_for_delivery", "delivered"].includes(shipment.status) ? "Completed" : undefined),
      status: getTimelineMilestoneStatus(4, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(4, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 5,
      title: locale === 'ar' ? 'وصول الكابتن' : 'Captain Arrived',
      timestamp: getMilestoneTime("out_for_delivery", ["out_for_delivery", "delivered"].includes(shipment.status) ? "Completed" : undefined),
      status: getTimelineMilestoneStatus(5, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(5, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 6,
      title: locale === 'ar' ? 'رمز التحقق (OTP)' : 'Waiting for OTP',
      timestamp: shipment.proofOfDelivery?.verifiedAt ? formatMilestoneTime(shipment.proofOfDelivery.verifiedAt) : undefined,
      status: getTimelineMilestoneStatus(6, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(6, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 7,
      title: locale === 'ar' ? 'صورة التسليم' : 'Delivery Photo',
      timestamp: shipment.proofOfDelivery?.packageImage ? (shipment.proofOfDelivery.verifiedAt ? formatMilestoneTime(shipment.proofOfDelivery.verifiedAt) : "Completed") : undefined,
      status: getTimelineMilestoneStatus(7, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(7, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 8,
      title: locale === 'ar' ? 'تحرير الأموال' : 'Money Released',
      timestamp: shipment.status === 'delivered' && shipment.proofOfDelivery?.verifiedAt ? formatMilestoneTime(shipment.proofOfDelivery.verifiedAt) : undefined,
      status: getTimelineMilestoneStatus(8, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(8, shipment.status, shipment.proofOfDelivery),
    },
    {
      step: 9,
      title: locale === 'ar' ? 'تقييم الخدمة' : 'Review Available',
      status: getTimelineMilestoneStatus(9, shipment.status, shipment.proofOfDelivery),
      description: getMilestoneDescription(9, shipment.status, shipment.proofOfDelivery),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              {t("title")}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Live Status Summary & Map */}
        <div className="lg:col-span-7 flex flex-col gap-2 relative">
          
          {/* Delivery Status Summary Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-wider animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                  {locale === 'ar' ? 'تتبع مباشر' : 'Live Tracking'}
                </span>
                <span className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400">
                  <Signal className="h-3 w-3 text-emerald-500" />
                  {locale === "ar" ? "GPS نشط" : "GPS Signal: Live"}
                </span>
                <span className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400">
                  <span className={cn("h-1.5 w-1.5 rounded-full transition-colors duration-300", captainOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-500")} />
                  {locale === "ar" 
                    ? `الكابتن: ${captainOnline ? 'متصل' : 'غير متصل'}` 
                    : `Captain: ${captainOnline ? 'Online' : 'Offline'}`}
                </span>
                <span className="flex items-center gap-1 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {locale === "ar" ? "أنت: متصل" : "You: Connected"}
                </span>
              </div>
              <span className="text-sm font-bold text-zinc-100 mt-1">
                {statusDescriptions[locale as 'ar' | 'en'][shipment.status as keyof typeof statusDescriptions.en] || shipment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t sm:border-t-0 rtl:sm:border-r ltr:sm:border-l border-zinc-800 pt-4 sm:pt-0 rtl:sm:pr-6 ltr:sm:pl-6 w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{locale === 'ar' ? 'الوصول المتوقع' : 'ETA'}</span>
                <span className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-400" />
                  {computedEtaText}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{locale === 'ar' ? 'المسافة' : 'Distance'}</span>
                <span className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center gap-1">
                  <Compass className="h-3 w-3 text-blue-400" />
                  {liveRemainingKm !== null ? `${liveRemainingKm.toFixed(1)} ${locale === 'ar' ? 'كم' : 'KM'}` : `${shipment.distanceKm || '--'} ${locale === 'ar' ? 'كم' : 'KM'}`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{locale === 'ar' ? 'السرعة الحالية' : 'Speed'}</span>
                <span className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-amber-500 rotate-45" />
                  {currentSpeed !== null ? `${currentSpeed} ${locale === 'ar' ? 'كم/س' : 'km/h'}` : (locale === 'ar' ? 'ثابت' : 'Stationary')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{locale === 'ar' ? 'آخر تحديث' : 'Last Update'}</span>
                <span className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 text-emerald-400" />
                  {secondsSinceLastUpdate < 5 ? (locale === 'ar' ? 'الآن' : 'Just now') : `${secondsSinceLastUpdate}s ${locale === 'ar' ? 'مضت' : 'ago'}`}
                </span>
              </div>
            </div>
          </div>

          <MapView
            pickupCoords={parsedPickup}
            deliveryCoords={parsedDelivery}
            captainCoords={captainCoords}
            zoom={13}
            height="380px"
            locale={locale}
            shipmentStatus={shipment.status}
          />
        </div>

        {/* Right Column: Cards (Action, Timeline, PoD, Wallet, Captain) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Current Action Card */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              {shipment.status === 'delivered' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Clock className="h-4 w-4 animate-spin-slow text-blue-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{locale === 'ar' ? 'الإجراء الحالي' : 'CURRENT ACTION'}</span>
              <span className="text-xs font-semibold text-blue-400 mt-0.5">
                {getCurrentActionMessage(shipment.status, shipment.proofOfDelivery)}
              </span>
            </div>
          </div>

          {/* Shipment Timeline Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-100">
                  {shipment.trackingNumber}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  {shipment.pickupAddress.split(",")[0]} {locale === 'ar' ? '⬅' : '➔'} {shipment.deliveryAddress.split(",")[0]}
                </span>
              </div>
              <Package className="h-5 w-5 text-blue-500" />
            </div>

            <TrackingTimeline 
              milestones={milestones} 
              progressPercent={shipment.deliveryProgressPercent}
              onMilestoneClick={(step) => {
                if (step === 9) setIsReviewOpen(true);
              }}
            />
          </div>

          {/* Proof of Delivery Card (Unified GPS, OTP and Photo) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                {locale === "ar" ? "إثبات التوصيل (PoD)" : "Proof of Delivery"}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* 1. GPS Verification */}
              <div className="flex items-start justify-between text-xs gap-3">
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-300">{locale === "ar" ? "التحقق من الموقع (GPS)" : "GPS Verification"}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      {locale === "ar" ? "المسافة الحالية للكابتن: " : "Captain distance: "}
                      {liveRemainingKm !== null 
                        ? `${(liveRemainingKm * 1000).toFixed(0)}m` 
                        : (shipment.status === 'delivered' ? '0m' : (locale === 'ar' ? 'جاري التحديد...' : 'Calculating...'))}
                    </span>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                  shipment.status === 'delivered' || (liveRemainingKm !== null && liveRemainingKm <= 0.2)
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                )}>
                  {shipment.status === 'delivered' || (liveRemainingKm !== null && liveRemainingKm <= 0.2)
                    ? (locale === "ar" ? "مؤكد" : "Verified")
                    : (locale === "ar" ? "قيد الانتظار" : "Pending")}
                </span>
              </div>

              {/* 2. OTP Verification */}
              <div className="flex items-start justify-between text-xs gap-3 border-t border-zinc-800/45 pt-3">
                <div className="flex gap-2 w-full">
                  <KeyRound className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col w-full">
                    <span className="font-semibold text-zinc-300">{locale === "ar" ? "رمز التحقق الثنائي (OTP)" : "OTP Verification"}</span>
                    
                    {/* OTP Code display */}
                    {["picked_up", "in_transit", "out_for_delivery"].includes(shipment.status) ? (
                      <div className="flex flex-col gap-2 mt-2 bg-zinc-950/80 border border-zinc-850 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-mono font-bold tracking-widest text-blue-400">
                            {shipment.proofOfDelivery?.otpCode || "------"}
                          </span>
                          
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (shipment.proofOfDelivery?.otpCode) {
                                  navigator.clipboard.writeText(shipment.proofOfDelivery.otpCode);
                                }
                              }}
                              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                              title={locale === "ar" ? "نسخ" : "Copy"}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleRegenerateOTP}
                              disabled={otpLoading}
                              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 transition-colors"
                              title={locale === "ar" ? "تحديث" : "Refresh"}
                            >
                              <RefreshCw className={cn("h-3.5 w-3.5", otpLoading && "animate-spin")} />
                            </button>
                          </div>
                        </div>
                        
                        {otpTimeLeft && (
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-850/60 pt-1.5 mt-1">
                            <span>{locale === 'ar' ? 'الوقت المتبقي لانتهاء الرمز:' : 'Expires in:'}</span>
                            <span className="font-mono text-amber-500/90 font-semibold">{otpTimeLeft}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500 mt-1">
                        {shipment.status === 'delivered' 
                          ? (locale === "ar" ? "تم التحقق من الرمز بنجاح" : "OTP verified successfully")
                          : (locale === "ar" ? "بانتظار بدء التوصيل لتوليد الرمز" : "OTP will generate once transit starts")}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                  shipment.status === 'delivered' || shipment.proofOfDelivery?.verifiedAt
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                )}>
                  {shipment.status === 'delivered' || shipment.proofOfDelivery?.verifiedAt
                    ? (locale === "ar" ? "مؤكد" : "Verified")
                    : (locale === "ar" ? "قيد الانتظار" : "Pending")}
                </span>
              </div>

              {/* 3. Delivery Photo */}
              <div className="flex flex-col gap-2 border-t border-zinc-800/45 pt-3">
                <div className="flex items-start justify-between text-xs gap-3">
                  <div className="flex gap-2">
                    <Camera className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-300">{locale === "ar" ? "صورة إثبات التوصيل" : "Delivery Photo"}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">
                        {shipment.proofOfDelivery?.packageImage 
                          ? (locale === "ar" ? "تم رفع الصورة بواسطة الكابتن" : "Photo uploaded by captain")
                          : (locale === "ar" ? "بانتظار قيام الكابتن برفع صورة الطرد" : "Awaiting package photo upload")}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                    shipment.proofOfDelivery?.packageImage
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  )}>
                    {shipment.proofOfDelivery?.packageImage
                      ? (locale === "ar" ? "تم الرفع" : "Uploaded")
                      : (locale === "ar" ? "بانتظار الرفع" : "Waiting")}
                  </span>
                </div>

                {shipment.proofOfDelivery?.packageImage && (
                  <div className="relative h-32 bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden group mt-2 shadow-inner">
                    <img 
                      src={shipment.proofOfDelivery.packageImage} 
                      alt="Delivery Proof Package" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <a 
                      href={shipment.proofOfDelivery.packageImage} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs text-white font-bold gap-1 cursor-pointer"
                    >
                      <span>🔍 {locale === "ar" ? "عرض الصورة كاملة" : "View Fullscreen"}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Escrow Status Card */}
          {shipment.price && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  {locale === "ar" ? "حالة الدفع بالمحفظة" : "Wallet Payment Status"}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                  shipment.status === 'delivered'
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                )}>
                  {shipment.status === 'delivered' 
                    ? (locale === "ar" ? "تم التحرير" : "Released") 
                    : (locale === "ar" ? "معلقة في الضمان" : "Held in Escrow")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col bg-zinc-950/50 p-3 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 font-semibold">{locale === "ar" ? "المبلغ المحتجز" : "Held Balance"}</span>
                  <span className="text-base font-bold text-zinc-200 mt-1">EGP {shipment.price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col bg-zinc-950/50 p-3 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 font-semibold">{locale === "ar" ? "رصيدك المتاح" : "Available Balance"}</span>
                  <span className="text-base font-bold text-zinc-200 mt-1">
                    EGP {wallet?.balance !== undefined ? wallet.balance.toFixed(2) : '--'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] leading-relaxed text-zinc-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-850 flex gap-2 items-start">
                {shipment.status === 'delivered' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {locale === "ar" 
                        ? "تم تحرير المبلغ بنجاح لحساب الكابتن بعد إتمام التحقق من التوصيل." 
                        : "Funds released successfully to the captain after delivery verification completed."}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {locale === "ar" 
                        ? "أموالك محتفظ بها بأمان في الضمان ولن يتم تحريرها للكابتن إلا بعد إدخال رمز OTP وتصوير الطرد." 
                        : "Funds are securely held in escrow and will not be released until delivery verification is complete."}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Captain Card */}
          {displayProvider && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  {displayProvider.role === t("captain") 
                    ? (locale === "ar" ? "بيانات الكابتن" : "Captain Information") 
                    : (locale === "ar" ? "بيانات المكتب" : "Office Information")}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0",
                  shipment.status === 'out_for_delivery'
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : shipment.status === 'delivered'
                    ? "bg-zinc-850 text-zinc-400 border border-zinc-800"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                )}>
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    shipment.status === 'out_for_delivery'
                      ? "bg-emerald-500 animate-ping"
                      : shipment.status === 'delivered'
                      ? "bg-zinc-500"
                      : "bg-blue-500 animate-ping"
                  )} />
                  {shipment.status === 'out_for_delivery'
                    ? (locale === 'ar' ? 'وصل للوجهة' : 'Arrived')
                    : shipment.status === 'delivered'
                    ? (locale === 'ar' ? 'أتم المهمة' : 'Completed')
                    : (shipment.status === 'picked_up' || shipment.status === 'in_transit')
                    ? (locale === 'ar' ? 'يقود الشاحنة' : 'Driving')
                    : (locale === 'ar' ? 'متصل' : 'Online')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {displayProvider.avatarUrl ? (
                      <img
                        src={displayProvider.avatarUrl}
                        alt={displayProvider.name}
                        className="h-12 w-12 rounded-full object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 text-sm">
                        {displayProvider.initials}
                      </div>
                    )}
                    <span className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border border-zinc-900 transition-colors duration-300",
                      captainOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-zinc-500"
                    )} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">
                      {displayProvider.name}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {displayProvider.rating?.toFixed(1)} ({displayProvider.role})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {displayProvider.phone ? (
                    <a
                      href={`tel:${displayProvider.phone}`}
                      aria-label={t("callProvider")}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 hover:bg-zinc-850 hover:text-emerald-300 transition-all flex items-center justify-center shadow-sm"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-700 cursor-not-allowed flex items-center justify-center"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                  {displayProvider.phone ? (
                    <a
                      href={`https://wa.me/${(() => {
                        const cleaned = displayProvider.phone.replace(/\D/g, "");
                        if (cleaned.startsWith("01") && cleaned.length === 11) {
                          return "20" + cleaned.slice(1);
                        }
                        return cleaned;
                      })()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("messageProvider")}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-blue-400 hover:bg-zinc-850 hover:text-blue-300 transition-all flex items-center justify-center shadow-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-700 cursor-not-allowed flex items-center justify-center"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isReviewOpen && displayProvider && shipment && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSubmitSuccess={() => {
            setIsReviewOpen(false);
          }}
          shipmentId={shipment.id}
          trackingNumber={shipment.trackingNumber}
          revieweeId={captain ? (captain._id || captain.id) : (selectedOffer?.providerId || "")}
          revieweeType={captain ? "Driver" : "Office"}
          revieweeName={displayProvider.name}
        />
      )}
    </div>
  );
}
