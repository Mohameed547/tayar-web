"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shipmentRequestSchema } from "@/lib/validation/common";
import { cn } from "@/lib/utils";
import { MapPin, Search, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { createShipment } from "@/features/shipments";

type ShipmentFormValues = z.infer<typeof shipmentRequestSchema>;

const calculateDynamicPrice = (weightVal: number, pkgType: string, speed: string): number => {
  let base = 100;
  if (weightVal) {
    base += Math.max(0, weightVal) * 15;
  }
  switch (pkgType) {
    case "medium_box":
      base += 30;
      break;
    case "large_box":
      base += 60;
      break;
    case "pallet":
      base += 150;
      break;
  }
  switch (speed) {
    case "express":
      base += 50;
      break;
    case "scheduled":
      base += 20;
      break;
  }
  return Math.round(base);
};

export default function NewShipmentView() {
  const t = useTranslations("customer.newShipment");
  const validation = useTranslations("validation");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [isPriceEdited, setIsPriceEdited] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentRequestSchema),
    defaultValues: {
      pickupAddress: "12 Tahrir Square, Cairo",
      deliveryAddress: "",
      weight: 2.5,
      packageType: "small_box",
      deliverySpeed: "standard",
      notes: "",
    },
  });

  const [
    pickupAddress,
    deliveryAddress,
    weight,
    packageType,
    deliverySpeed,
    scheduledDate,
  ] = useWatch({
    control,
    name: [
      "pickupAddress",
      "deliveryAddress",
      "weight",
      "packageType",
      "deliverySpeed",
      "scheduledDate",
    ],
  });

  const price = useWatch({ control, name: "price" });

  const hasCompleteRoute = Boolean(pickupAddress && deliveryAddress);
  const distance = hasCompleteRoute ? t("distanceValue") : "-";
  const estPrice = hasCompleteRoute ? t("priceValue") : "-";

  useEffect(() => {
    if (hasCompleteRoute) {
      if (!isPriceEdited) {
        const computedPrice = calculateDynamicPrice(weight, packageType, deliverySpeed);
        setValue("price", computedPrice, { shouldValidate: true });
      }
    } else {
      setValue("price", undefined);
    }
  }, [hasCompleteRoute, weight, packageType, deliverySpeed, isPriceEdited, setValue]);

  const onSubmit = async (data: ShipmentFormValues) => {
    setSubmitting(true);
    console.log("Submitting shipment request payload:", data);
    try {
      await createShipment({
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        pickupCoords: [30.0444, 31.2357],
        deliveryCoords: [30.0561, 31.3301],
        weight: data.weight,
        packageType: data.packageType,
        deliverySpeed: data.deliverySpeed,
        notes: data.notes,
        price: data.price,
      });
      router.push("/offers/sc-00412");
    } catch (err) {
      console.error("Failed to create shipment, proceeding with mock fallback:", err);
      router.push("/offers/sc-00412");
    } finally {
      setSubmitting(false);
    }
  };

  const getPackageTypeLabel = (val: string) => {
    switch (val) {
      case "small_box":
        return t("smallBox");
      case "medium_box":
        return t("mediumBox");
      case "large_box":
        return t("largeBox");
      case "pallet":
        return t("pallet");
      default:
        return val;
    }
  };

  const getSpeedLabel = (val: string) => {
    switch (val) {
      case "standard":
        return `${t("standard")} (${t("standardTime")})`;
      case "express":
        return `${t("express")} (${t("expressTime")})`;
      case "scheduled":
        return `${t("scheduled")} (${t("scheduledTime")})`;
      default:
        return val;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            {t("title")}
          </h1>
          <p className="text-xs text-blue-500 font-semibold mt-1">
            {t("step")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-blue-600" />
          <span className="h-1.5 w-6 rounded-full bg-zinc-800" />
          <span className="h-1.5 w-6 rounded-full bg-zinc-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-7 flex flex-col gap-5 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">
              {t("pickupAddress")}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
              <input
                type="text"
                {...register("pickupAddress")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder={t("pickupPlaceholder")}
              />
            </div>
            {errors.pickupAddress && (
              <span className="text-[11px] text-red-400 font-medium">
                {validation(errors.pickupAddress.message as never)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">
              {t("deliveryAddress")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                {...register("deliveryAddress")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder={t("deliveryPlaceholder")}
              />
            </div>
            {errors.deliveryAddress && (
              <span className="text-[11px] text-red-400 font-medium">
                {validation(errors.deliveryAddress.message as never)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400">
                {t("weight")}
              </label>
              <input
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                placeholder="2.5"
              />
              {errors.weight && (
                <span className="text-[11px] text-red-400 font-medium">
                  {validation(errors.weight.message as never)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400">
                {t("packageType")}
              </label>
              <select
                {...register("packageType")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2371717a' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center'
                }}
              >
                <option value="small_box" className="bg-zinc-900 text-zinc-200">{t("smallBox")}</option>
                <option value="medium_box" className="bg-zinc-900 text-zinc-200">{t("mediumBox")}</option>
                <option value="large_box" className="bg-zinc-900 text-zinc-200">{t("largeBox")}</option>
                <option value="pallet" className="bg-zinc-900 text-zinc-200">{t("pallet")}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">
              {t("deliverySpeed")}
            </label>
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {[
                { id: "standard", label: t("standard"), sub: t("standardTime") },
                { id: "express", label: t("express"), sub: t("expressTime") },
                { id: "scheduled", label: t("scheduled"), sub: t("scheduledTime") },
              ].map((speed) => (
                <button
                  key={speed.id}
                  type="button"
                  onClick={() => {
                    setValue("deliverySpeed", speed.id as "standard" | "express" | "scheduled");
                    if (speed.id !== "scheduled") {
                      setValue("scheduledDate", undefined);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center py-2.5 rounded-lg transition-all duration-200",
                    deliverySpeed === speed.id
                      ? "bg-zinc-900 border border-zinc-700 text-blue-400 shadow-sm ring-1 ring-zinc-700"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent"
                  )}
                >
                  <span className="text-xs font-bold">{speed.label}</span>
                  <span className="text-[9px] mt-0.5 opacity-80">{speed.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {deliverySpeed === "scheduled" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400">
                {t("scheduledDate")}
              </label>
              <input
                type="date"
                {...register("scheduledDate")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
              />
              {errors.scheduledDate && (
                <span className="text-[11px] text-red-400 font-medium">
                  {validation(errors.scheduledDate.message as never)}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">
              {t("notes")}
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
              placeholder={t("notesPlaceholder")}
            />
            {errors.notes && (
              <span className="text-[11px] text-red-400 font-medium">
                {validation(errors.notes.message as never)}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-lg text-sm transition-all duration-200 shadow-md focus:outline-none"
          >
            {submitting ? (
              <span>{t("posting")}</span>
            ) : (
              <>
                <span>{t("next")}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center relative min-h-[200px]">
            <div className="absolute inset-0 bg-[#e0f2fe]/10 flex items-center justify-center">
              <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="100" y2="50" stroke="#4b5563" strokeWidth="0.8" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#4b5563" strokeWidth="0.8" />
                <line x1="20" y1="0" x2="20" y2="100" stroke="#4b5563" strokeWidth="0.4" />
                <line x1="80" y1="0" x2="80" y2="100" stroke="#4b5563" strokeWidth="0.4" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#4b5563" strokeWidth="0.4" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#4b5563" strokeWidth="0.4" />
                {pickupAddress && deliveryAddress && (
                  <path d="M25,75 Q60,60 75,25" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,3" />
                )}
              </svg>

              {pickupAddress && (
                <div className="absolute left-[23%] bottom-[21%] flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 border border-zinc-950 shadow-md shadow-emerald-500/50" />
                </div>
              )}
              {pickupAddress && deliveryAddress && (
                <div className="absolute right-[22%] top-[22%] flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 border border-zinc-950 shadow-md shadow-red-500/50" />
                </div>
              )}
            </div>

            {pickupAddress && deliveryAddress && (
              <span className="absolute bottom-4 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-300 shadow-md uppercase tracking-wider">
                {t("routePreview", { distance })}
              </span>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2">
              {t("summary")}
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">{t("distance")}</span>
                <span className="text-zinc-200 font-semibold">{distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">{t("weight")}</span>
                <span className="text-zinc-200 font-semibold">{weight ? `${weight} kg` : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">{t("type")}</span>
                <span className="text-zinc-200 font-semibold">{getPackageTypeLabel(packageType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">{t("speed")}</span>
                <span className="text-zinc-200 font-semibold">{getSpeedLabel(deliverySpeed)}</span>
              </div>
              {deliverySpeed === "scheduled" && scheduledDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">{t("scheduledDate")}</span>
                  <span className="text-zinc-200 font-semibold">{String(scheduledDate)}</span>
                </div>
              )}
              <hr className="border-zinc-800 my-1" />
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-400 font-bold">{t("estimatedPrice")}</span>
                  <span className="text-blue-400 text-sm font-extrabold">{estPrice}</span>
                </div>
                {hasCompleteRoute && (
                  <div className="flex flex-col gap-1.5 mt-1 border-t border-zinc-800/50 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-zinc-500">
                        {t("customPrice")}
                      </label>
                      {isPriceEdited && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPriceEdited(false);
                            const computedPrice = calculateDynamicPrice(weight, packageType, deliverySpeed);
                            setValue("price", computedPrice, { shouldValidate: true });
                          }}
                          className="text-[10px] text-blue-500 hover:text-blue-400 font-semibold focus:outline-none"
                        >
                          {t("resetToAuto")}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        {...register("price", {
                          valueAsNumber: true,
                          onChange: () => setIsPriceEdited(true),
                        })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-bold focus:outline-none focus:border-zinc-700 transition-colors"
                        placeholder={t("customPricePlaceholder")}
                      />
                    </div>
                    {errors.price && (
                      <span className="text-[10px] text-red-400 font-medium">
                        {validation(errors.price.message as never)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
