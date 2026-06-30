"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shipmentRequestSchema } from "@/lib/validation/common";
import { cn } from "@/lib/utils";
import { MapPin, Search, ArrowRight, Navigation, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { createShipment } from "@/features/shipments";
import { calculateDistance, reverseGeocode, fetchAddressSuggestions, type MapSuggestion } from "@/lib/utils/map";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full bg-zinc-950 flex items-center justify-center text-xs text-zinc-500 font-semibold border border-zinc-800 rounded-xl">
      Loading Map Container...
    </div>
  ),
});

type ShipmentFormValues = z.infer<typeof shipmentRequestSchema>;

const calculateEstimatedArrival = (distance: number, speed: string, lang: string): string => {
  if (speed === "scheduled") {
    return lang === "ar" ? "حسب الموعد المحدّد" : "As scheduled";
  }
  if (speed === "express") {
    if (distance < 50) {
      return lang === "ar" ? "ساعة إلى ساعتين" : "1–2 hours";
    } else if (distance < 150) {
      return lang === "ar" ? "ساعتان إلى 3 ساعات" : "2–3 hours";
    } else if (distance < 300) {
      return lang === "ar" ? "4 إلى 5 ساعات" : "4–5 hours";
    } else {
      return lang === "ar" ? "6 إلى 8 ساعات" : "6–8 hours";
    }
  } else { // standard
    if (distance < 50) {
      return lang === "ar" ? "3 إلى 4 ساعات" : "3–4 hours";
    } else if (distance < 150) {
      return lang === "ar" ? "5 إلى 6 ساعات" : "5–6 hours";
    } else if (distance < 300) {
      return lang === "ar" ? "يوم واحد" : "1 day";
    } else {
      return lang === "ar" ? "يومين" : "2 days";
    }
  }
};

const calculateDynamicPrice = (weightVal: number, pkgType: string, speed: string, distanceKm: number = 5): number => {
  let base = 50 + distanceKm * 15;
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
  const locale = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [isPriceEdited, setIsPriceEdited] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Map state
  const [pickupCoords, setPickupCoords] = useState<[number, number] | undefined>([30.0444, 31.2357]);
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | undefined>(undefined);
  const [activeField, setActiveField] = useState<'pickup' | 'delivery' | null>(null);
  const [detectingLocation, setDetectingLocation] = useState<'pickup' | 'delivery' | null>(null);

  // Suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState<MapSuggestion[]>([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState<MapSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<'pickup' | 'delivery' | null>(null);
  const [selectedPickupName, setSelectedPickupName] = useState<string>("");
  const [selectedDeliveryName, setSelectedDeliveryName] = useState<string>("");
  const [minBudget, setMinBudget] = useState<number | undefined>(undefined);
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);

  const handleGetCurrentLocation = (field: 'pickup' | 'delivery') => {
    if (!navigator.geolocation) {
      alert(locale === 'ar' ? 'تحديد الموقع الجغرافي غير مدعوم في متصفحك' : 'Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(field);
    setValue(
      field === 'pickup' ? 'pickupAddress' : 'deliveryAddress',
      locale === 'ar' ? 'جاري تحديد موقعك الحالي...' : 'Locating your current location...'
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          if (field === 'pickup') {
            setPickupCoords([latitude, longitude]);
            setValue('pickupAddress', address, { shouldValidate: true });
          } else if (field === 'delivery') {
            setDeliveryCoords([latitude, longitude]);
            setValue('deliveryAddress', address, { shouldValidate: true });
          }
        } catch (err) {
          console.error("Error geocoding current location:", err);
          setValue(field === 'pickup' ? 'pickupAddress' : 'deliveryAddress', '');
        } finally {
          setDetectingLocation(null);
        }
      },
      (error) => {
        console.error("Error getting geolocation:", error);
        alert(
          locale === 'ar' 
            ? 'فشل في الحصول على موقعك. يرجى التأكد من السماح بالوصول للموقع.' 
            : 'Failed to retrieve your location. Please check your location permissions.'
        );
        setValue(field === 'pickup' ? 'pickupAddress' : 'deliveryAddress', '');
        setDetectingLocation(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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

  const hasCompleteRoute = Boolean(pickupCoords && deliveryCoords);
  const distanceKm = hasCompleteRoute && pickupCoords && deliveryCoords
    ? calculateDistance(pickupCoords[0], pickupCoords[1], deliveryCoords[0], deliveryCoords[1])
    : 0;

  const distance = hasCompleteRoute ? `${distanceKm} km` : "-";
  
  const computedPrice = hasCompleteRoute ? calculateDynamicPrice(weight, packageType, deliverySpeed, distanceKm) : 0;
  const minPrice = Math.max(10, Math.round((computedPrice * 0.9) / 10) * 10);
  const maxPrice = Math.round((computedPrice * 1.1) / 10) * 10;
  const estPrice = hasCompleteRoute 
    ? (locale === 'ar' ? `${minPrice} – ${maxPrice} ج.م` : `${minPrice} – ${maxPrice} EGP`) 
    : "-";

  useEffect(() => {
    if (hasCompleteRoute && pickupCoords && deliveryCoords) {
      if (!isPriceEdited) {
        const computed = calculateDynamicPrice(weight, packageType, deliverySpeed, distanceKm);
        const autoMin = Math.max(10, Math.round((computed * 0.9) / 10) * 10);
        const autoMax = Math.round((computed * 1.1) / 10) * 10;
        setMinBudget(autoMin);
        setMaxBudget(autoMax);
        setValue("price", computed, { shouldValidate: true });
      }
    } else {
      setValue("price", undefined);
      setMinBudget(undefined);
      setMaxBudget(undefined);
    }
  }, [hasCompleteRoute, pickupCoords, deliveryCoords, weight, packageType, deliverySpeed, isPriceEdited, setValue, distanceKm]);

  // Automatically set deliveryAddress to device location on load
  useEffect(() => {
    if (navigator.geolocation) {
      setValue('deliveryAddress', locale === 'ar' ? 'جاري تحديد موقعك الحالي...' : 'Locating your current location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const address = await reverseGeocode(latitude, longitude);
            setDeliveryCoords([latitude, longitude]);
            setValue('deliveryAddress', address, { shouldValidate: true });
          } catch (err) {
            console.error("Error auto-fetching delivery address:", err);
            setValue('deliveryAddress', '');
          }
        },
        (err) => {
          console.warn("Auto geolocation on load blocked or failed:", err);
          setValue('deliveryAddress', '');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [setValue, locale]);

  // Debounced search for pickup address suggestions
  useEffect(() => {
    if (
      !pickupAddress || 
      pickupAddress.trim().length < 3 || 
      pickupAddress === selectedPickupName ||
      pickupAddress.includes("جاري تحديد") || 
      pickupAddress.includes("Locating") ||
      pickupAddress.includes("Fetching") ||
      pickupAddress.includes("جاري جلب")
    ) {
      setPickupSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions('pickup');
      try {
        const results = await fetchAddressSuggestions(pickupAddress, locale);
        setPickupSuggestions(results);
      } catch (err) {
        console.error("Error fetching pickup suggestions:", err);
      } finally {
        setLoadingSuggestions(null);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [pickupAddress, selectedPickupName, locale]);

  // Debounced search for delivery address suggestions
  useEffect(() => {
    if (
      !deliveryAddress || 
      deliveryAddress.trim().length < 3 || 
      deliveryAddress === "12 Tahrir Square, Cairo" || 
      deliveryAddress === selectedDeliveryName ||
      deliveryAddress.includes("جاري تحديد") || 
      deliveryAddress.includes("Locating") ||
      deliveryAddress.includes("Fetching") ||
      deliveryAddress.includes("جاري جلب")
    ) {
      setDeliverySuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions('delivery');
      try {
        const results = await fetchAddressSuggestions(deliveryAddress, locale);
        setDeliverySuggestions(results);
      } catch (err) {
        console.error("Error fetching delivery suggestions:", err);
      } finally {
        setLoadingSuggestions(null);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [deliveryAddress, selectedDeliveryName, locale]);

  // Click outside listener to clear suggestions
  useEffect(() => {
    const handleOutsideClick = () => {
      setPickupSuggestions([]);
      setDeliverySuggestions([]);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSelectSuggestion = (field: 'pickup' | 'delivery', suggestion: MapSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    if (field === 'pickup') {
      setSelectedPickupName(suggestion.display_name);
      setPickupCoords([lat, lon]);
      setPickupSuggestions([]);
      setValue('pickupAddress', suggestion.display_name, { shouldValidate: true });
    } else {
      setSelectedDeliveryName(suggestion.display_name);
      setDeliveryCoords([lat, lon]);
      setDeliverySuggestions([]);
      setValue('deliveryAddress', suggestion.display_name, { shouldValidate: true });
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const field = activeField || 'pickup';
    setValue(
      field === 'pickup' ? 'pickupAddress' : 'deliveryAddress',
      locale === 'ar' ? 'جاري جلب العنوان من الخريطة...' : 'Fetching address from map...'
    );
    const address = await reverseGeocode(lat, lng);
    if (field === 'pickup') {
      setPickupCoords([lat, lng]);
      setValue('pickupAddress', address, { shouldValidate: true });
    } else if (field === 'delivery') {
      setDeliveryCoords([lat, lng]);
      setValue('deliveryAddress', address, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ShipmentFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    console.log("Submitting shipment request payload:", data);
    try {
      const newShipment = await createShipment({
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress,
        pickupCoords: pickupCoords ? [pickupCoords[1], pickupCoords[0]] : [31.2357, 30.0444],
        deliveryCoords: deliveryCoords ? [deliveryCoords[1], deliveryCoords[0]] : [31.3301, 30.0561],
        weight: data.weight,
        packageType: data.packageType,
        deliverySpeed: data.deliverySpeed,
        notes: data.notes || undefined,
        price: data.price,
        estimatedPriceMin: minBudget,
        estimatedPriceMax: maxBudget,
        ...(data.deliverySpeed === "scheduled" && data.scheduledDate
          ? { scheduledDate: String(data.scheduledDate) }
          : {}),
      });
      router.push(`/offers/${newShipment.id}`);
    } catch (err: any) {
      console.error("Failed to create shipment:", err);
      
      const backendMessage = err.response?.data?.message;
      let displayMessage = "";
      
      if (backendMessage && (backendMessage.toLowerCase().includes("insufficient wallet balance") || backendMessage.toLowerCase().includes("insufficient balance"))) {
        displayMessage = locale === 'ar'
          ? "رصيد المحفظة غير كافٍ لتغطية تكلفة الشحنة. يرجى شحن محفظتك للمتابعة."
          : "Insufficient wallet balance to cover the shipment cost. Please top up your wallet to continue.";
      } else {
        displayMessage = backendMessage || err.message || (locale === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.');
      }
      
      setSubmitError(displayMessage);
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
          <div className="text-[11px] text-zinc-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/80 leading-relaxed">
            💡 {locale === 'ar'
              ? 'تلميح: اضغط على حقل "عنوان الاستلام" أو "عنوان التسليم" أولاً، ثم انقر على أي مكان في الخريطة لتحديده تلقائياً.'
              : 'Tip: Click on either the "Pickup Address" or "Delivery Address" field first, then click anywhere on the map to set it automatically.'}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400">
              {t("pickupAddress")}
            </label>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
              <input
                type="text"
                {...register("pickupAddress")}
                onFocus={() => setActiveField("pickup")}
                className={cn(
                  "w-full bg-zinc-900 border ps-10 pe-12 py-2.5 text-sm text-zinc-200 focus:outline-none transition-all duration-200",
                  activeField === "pickup"
                    ? "border-rose-500 ring-1 ring-rose-500/30"
                    : "border-zinc-800 focus:border-zinc-700"
                )}
                placeholder={t("pickupPlaceholder")}
              />
              <button
                type="button"
                onClick={() => handleGetCurrentLocation('pickup')}
                disabled={detectingLocation === 'pickup'}
                title={t("selectCurrentLocation")}
                className="absolute end-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors disabled:opacity-50"
              >
                {detectingLocation === 'pickup' ? (
                  <div className="h-3 w-3 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                ) : (
                  <Navigation className="h-3.5 w-3.5" />
                )}
              </button>

              {pickupSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-md divide-y divide-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
                  {pickupSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion('pickup', item)}
                      className="w-full text-start px-4 py-3 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-start gap-2.5"
                    >
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-rose-500 shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
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
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              <input
                type="text"
                {...register("deliveryAddress")}
                onFocus={() => setActiveField("delivery")}
                className={cn(
                  "w-full bg-zinc-900 border ps-10 pe-12 py-2.5 text-sm text-zinc-200 focus:outline-none transition-all duration-200",
                  activeField === "delivery"
                    ? "border-emerald-500 ring-1 ring-emerald-500/30"
                    : "border-zinc-800 focus:border-zinc-700"
                )}
                placeholder={t("deliveryPlaceholder")}
              />
              <button
                type="button"
                onClick={() => handleGetCurrentLocation('delivery')}
                disabled={detectingLocation === 'delivery'}
                title={t("selectCurrentLocation")}
                className="absolute end-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
              >
                {detectingLocation === 'delivery' ? (
                  <div className="h-3 w-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                ) : (
                  <Navigation className="h-3.5 w-3.5" />
                )}
              </button>

              {deliverySuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-md divide-y divide-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
                  {deliverySuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion('delivery', item)}
                      className="w-full text-start px-4 py-3 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-start gap-2.5"
                    >
                      <MapPin className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
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

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">
                  {locale === 'ar' ? 'فشل في إنشاء الشحنة' : 'Failed to create shipment'}
                </p>
                <p className="mt-1 text-zinc-400 leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

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
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 mb-1">
              <span>{locale === 'ar' ? 'معاينة خريطة المسار' : 'Route Map Preview'}</span>
              {activeField && (
                <span className={cn(
                  "animate-pulse text-[11px] font-bold px-2 py-0.5 rounded",
                  activeField === 'pickup' ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
                )}>
                  📍 {activeField === 'pickup' 
                    ? (locale === 'ar' ? 'انقر لتحديد موقع الاستلام' : 'Click map to set Pickup') 
                    : (locale === 'ar' ? 'انقر لتحديد موقع التسليم' : 'Click map to set Delivery')}
                </span>
              )}
            </div>
            <MapView
              pickupCoords={pickupCoords}
              deliveryCoords={deliveryCoords}
              interactive={true}
              onMapClick={handleMapClick}
              height="300px"
            />
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
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">
                  {locale === 'ar' ? 'الوصول المتوقع' : 'Estimated Arrival'}
                </span>
                <span className="text-zinc-200 font-semibold">
                  {hasCompleteRoute ? calculateEstimatedArrival(distanceKm, deliverySpeed, locale) : "-"}
                </span>
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
                  <span className="text-zinc-400 font-bold">
                    {locale === 'ar' ? 'نطاق الميزانية (ج.م)' : 'Budget Range (EGP)'}
                  </span>
                  {isPriceEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPriceEdited(false);
                        const computedVal = calculateDynamicPrice(weight, packageType, deliverySpeed, distanceKm);
                        const autoMin = Math.max(10, Math.round((computedVal * 0.9) / 10) * 10);
                        const autoMax = Math.round((computedVal * 1.1) / 10) * 10;
                        setMinBudget(autoMin);
                        setMaxBudget(autoMax);
                        setValue("price", computedVal, { shouldValidate: true });
                      }}
                      className="text-[10px] text-blue-500 hover:text-blue-400 font-semibold focus:outline-none"
                    >
                      {t("resetToAuto")}
                    </button>
                  )}
                </div>

                {hasCompleteRoute && (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {locale === 'ar' ? 'الحد الأدنى' : 'Min Price'}
                      </span>
                      <input
                        type="number"
                        value={minBudget || ""}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setMinBudget(val);
                          setIsPriceEdited(true);
                          setValue("price", Math.round((val + (maxBudget || 0)) / 2), { shouldValidate: true });
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-bold focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {locale === 'ar' ? 'الحد الأقصى' : 'Max Price'}
                      </span>
                      <input
                        type="number"
                        value={maxBudget || ""}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setMaxBudget(val);
                          setIsPriceEdited(true);
                          setValue("price", Math.round(((minBudget || 0) + val) / 2), { shouldValidate: true });
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-bold focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
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
