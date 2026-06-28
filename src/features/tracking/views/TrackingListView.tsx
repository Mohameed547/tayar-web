"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getShipments, getShipmentById } from "@/features/shipments/api";
import { mockShipments } from "@/constants/mock-data";
import type { Shipment } from "@/features/shipments/types";

export default function TrackingListView() {
  const t = useTranslations("customer.trackingSearch");
  const locale = useLocale();
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipments()
      .then((data) => {
        // filter shipments that have trackingNumber
        setShipments(data.filter((s) => s.trackingNumber));
      })
      .catch((err) => {
        console.error("Failed to load customer shipments for tracking:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingId.trim().toLowerCase();

    if (!cleanId) {
      setError(t("invalid"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await getShipmentById(cleanId);
      router.push(`/tracking/${cleanId}`);
    } catch (err) {
      const isMock = mockShipments.some(
        (s: Shipment) =>
          s.id.toLowerCase() === cleanId ||
          s.trackingNumber.toLowerCase() === cleanId
      );

      if (isMock) {
        router.push(`/tracking/${cleanId}`);
      } else {
        console.error("Tracking lookup failed:", err);
        setError(t("notFound") || "Shipment not found in database");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-xl mx-auto my-12">
      <div className="text-center flex flex-col gap-2">
        <div className="inline-flex mx-auto p-3 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/20 mb-2">
          <MapPin className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleTrack} className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md mt-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400">
            {t("trackingId")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase placeholder-zinc-500"
              placeholder={t("placeholder")}
            />
          </div>
          {error && (
            <span className="text-[11px] text-red-400 font-medium">
              {error}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white transition-all shadow-md focus:outline-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-t-white border-white/20 animate-spin" />
          ) : (
            t("action")
          )}
        </button>
      </form>

      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 mt-2 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          {t("yourShipments")}
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : shipments.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2 italic">
            {t("noActiveShipments")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {shipments.map((shipment) => (
              <button
                key={shipment.id}
                onClick={() => {
                  setTrackingId(shipment.trackingNumber);
                  setError("");
                }}
                className="text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1.5 focus:outline-none"
              >
                <span>{shipment.trackingNumber}</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  ({shipment.pickupAddress.split(",")[0]} {locale === 'ar' ? '←' : '→'} {shipment.deliveryAddress.split(",")[0]})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
