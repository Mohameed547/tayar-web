"use client";

import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReviewsView() {
  const t = useTranslations("customer.reviews");
  const reviews = [
    {
      id: "rev-1",
      entityName: t("captainName"),
      shipmentId: "SC-00408",
      rating: 5,
      comment: t("captainComment"),
      date: t("yesterday"),
    },
    {
      id: "rev-2",
      entityName: t("officeName"),
      shipmentId: "SC-00405",
      rating: 4,
      comment: t("officeComment"),
      date: t("weekAgo"),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {t("average")}
            </span>
            <span className="text-3xl font-extrabold text-amber-400 mt-1">
              4.5 / 5
            </span>
          </div>
          <div className="flex gap-1 text-amber-400 text-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {t("pending")}
            </span>
            <span className="text-3xl font-extrabold text-blue-500 mt-1">
              0
            </span>
          </div>
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-3 mb-4">
          {t("history")}
        </h2>

        <div className="flex flex-col gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col gap-2 border-b border-zinc-850 pb-4.5 last:border-none last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">
                    {rev.entityName}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {t("shipmentId", { id: rev.shipmentId })}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">{rev.date}</span>
              </div>

              <div className="flex gap-0.5 text-xs text-amber-400 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < rev.rating ? "opacity-100" : "opacity-25"}>
                    ★
                  </span>
                ))}
              </div>

              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
