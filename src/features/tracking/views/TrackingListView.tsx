"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TrackingListView() {
  const t = useTranslations("customer.trackingSearch");
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingId.trim().toLowerCase();

    if (!cleanId) {
      setError(t("invalid"));
      return;
    }

    setError("");
    router.push(`/tracking/${cleanId}`);
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
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors uppercase placeholder-zinc-500"
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
          className="w-full py-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md focus:outline-none"
        >
          {t("action")}
        </button>
      </form>

      <div className="text-center text-[10px] text-zinc-500 mt-2">
        <span>{t("tryTracking")} </span>
        <button
          onClick={() => {
            setTrackingId("SC-00412");
            setError("");
          }}
          className="text-blue-500 hover:underline font-semibold focus:outline-none"
        >
          SC-00412
        </button>
        <span> {t("or")} </span>
        <button
          onClick={() => {
            setTrackingId("SC-00408");
            setError("");
          }}
          className="text-blue-500 hover:underline font-semibold focus:outline-none"
        >
          SC-00408
        </button>
      </div>
    </div>
  );
}
