"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Package, Plus, Star, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { mockCustomer, mockShipments } from "@/constants/mock-data";
import ShipmentCard from "../components/shipment-card";
import StatCard from "@/shared/ui/StatCard";
import { getCustomerProfile } from "@/features/profile";
import { getShipments } from "@/features/shipments/api";
import type { Shipment } from "@/features/shipments/types";
import { getWallet } from "@/features/wallet/api";
import { getReviews } from "@/features/reviews/api";
import { getCurrentUser } from "@/features/auth/api";

import { useState, useEffect } from "react";

export default function CustomerDashboardView() {
  const t = useTranslations("customer.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [formattedDate, setFormattedDate] = useState("");
  const [customerName, setCustomerName] = useState(mockCustomer.name.split(" ")[0]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [walletBalance, setWalletBalance] = useState("EGP 0");
  const [averageRating, setAverageRating] = useState("5.0");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const activeShipments = shipments.filter(
    (shipment) =>
      shipment.status === "in_transit" ||
      shipment.status === "captain_assignment" ||
      shipment.status === "pending_offers"
  );

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user.isVerified) {
          router.replace(`/verify-otp?phone=${user.phone}`);
          return;
        }
        if ((user.role as string) === "customer" || user.role === "admin") {
          setAuthorized(true);
        } else if ((user.role as string) === "driver" || (user.role as string) === "office") {
          router.replace("/captain-dashboard");
        } else {
          router.replace("/login");
        }
        setCheckingAuth(false);
      })
      .catch((err) => {
        console.error("Unauthorized access to customer dashboard:", err);
        router.replace("/login");
        setCheckingAuth(false);
      });
  }, [router]);

  useEffect(() => {
    const today = new Date("2026-06-05");
    setFormattedDate(
      today.toLocaleDateString(
        locale === "ar" ? "ar-EG" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    );
  }, [locale]);

  useEffect(() => {
    if (!authorized) return;

    Promise.all([
      getCustomerProfile().then(data => data.name).catch(() => mockCustomer.name),
      getShipments().catch(err => {
        console.error("Failed to load shipments, using mock:", err);
        return mockShipments;
      }),
      getWallet().then(w => `EGP ${w.balance}`).catch(err => {
        console.error("Failed to load wallet, using mock:", err);
        return "EGP 320";
      }),
      getReviews().then(revs => {
        if (!revs || revs.length === 0) return "5.0";
        const sum = revs.reduce((acc, r) => acc + (r.rating || 5), 0);
        return (sum / revs.length).toFixed(1);
      }).catch(err => {
        console.error("Failed to load reviews, using mock:", err);
        return "4.6";
      })
    ]).then(([name, loadedShipments, balance, ratingVal]) => {
      if (name) {
        setCustomerName(name.split(" ")[0]);
      }
      setShipments(loadedShipments);
      setWalletBalance(balance);
      setAverageRating(ratingVal);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [authorized]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] text-zinc-400 text-sm font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin" />
          <span>{locale === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}</span>
        </div>
      </div>
    );
  }

  if (!authorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] text-zinc-400 text-sm font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin" />
          <span>{locale === 'ar' ? 'جاري تحميل لوحة التحكم...' : 'Loading dashboard...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-zinc-100 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {t("greeting", { name: customerName })}
          </h1>
          <p className="text-xs text-zinc-500 font-semibold">{formattedDate}</p>
        </div>

        <Link
          href="/shipments/new"
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 shadow-md focus:outline-none"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{t("newShipment")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalShipped")}
          value={shipments.length.toString()}
          icon={Package}
          description={t("totalShippedDescription")}
          colorClass="text-zinc-100"
          iconColorClass="text-zinc-400 bg-zinc-900 border-zinc-800"
        />
        <StatCard
          title={t("activeNow")}
          value={activeShipments.length.toString()}
          icon={Clock}
          description={t("activeNowDescription")}
          colorClass="text-blue-400"
          iconColorClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
        />
        <StatCard
          title={t("walletBalance")}
          value={walletBalance}
          icon={Wallet}
          description={t("walletDescription")}
          colorClass="text-emerald-400"
          iconColorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          href="/wallet"
        />
        <StatCard
          title={t("averageRating")}
          value={`${averageRating} ★`}
          icon={Star}
          description={t("ratingDescription")}
          colorClass="text-amber-400"
          iconColorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
          href="/reviews"
        />
      </div>

      <div className="flex flex-col gap-4.5 mt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          {t("activeShipments")}
        </h2>

        {activeShipments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-zinc-800 border-dashed rounded-xl text-center">
            <p className="text-xs text-zinc-500">{t("noActive")}</p>
            <Link
              href="/shipments/new"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold mt-2 underline underline-offset-4"
            >
              {t("requestShipment")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
