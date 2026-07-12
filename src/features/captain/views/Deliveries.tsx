'use client'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectDeliveries } from '@/features/captain/store/selectors'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { Delivery } from '@/features/tracking/types'

import { useLocale } from 'next-intl'

const STATUS_LABELS: Record<string, { en: string; ar: string; color: "blue" | "green" | "amber" | "red" | "gray" }> = {
  pending_offers: { en: "Pending Offers", ar: "في انتظار العروض", color: "amber" },
  captain_assignment: { en: "Pending Assignment", ar: "في انتظار التعيين", color: "blue" },
  assigned: { en: "Assigned", ar: "تم التعيين", color: "blue" },
  picked_up: { en: "Picked Up", ar: "تم الاستلام", color: "blue" },
  in_transit: { en: "In Transit", ar: "قيد التوصيل", color: "amber" },
  out_for_delivery: { en: "Out for Delivery", ar: "خرج للتسليم", color: "amber" },
  delivered: { en: "Delivered", ar: "تم التسليم", color: "green" },
  cancelled: { en: "Cancelled", ar: "ملغاة", color: "red" },
};

export default function Deliveries() {
  const t          = useCaptainTranslations()
  const deliveries = useAppSelector(selectDeliveries)
  const locale     = useLocale()
  const isRTL      = locale === 'ar'

  const columns = [
    {
      key: 'id',
      header: t('orderId'),
      render: (d: Delivery) => {
        const displayId = d.trackingNumber || d.id;
        const isTracking = !!d.trackingNumber;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`font-mono text-xs font-bold ${
              isTracking ? "text-blue-600 dark:text-blue-400" : "text-[var(--color-text-main)]"
            }`}>
              {displayId}
            </span>
            {isTracking && (
              <span className="text-[9px] text-[var(--color-text-sub)] uppercase tracking-wider font-semibold">
                ID: {d.id.substring(0, 8)}...
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'captain',
      header: t('assignedCaptain'),
      render: (d: Delivery) => {
        if (!d.captain) return <span className="text-[var(--color-text-sub)]">{t('noCaptainAssignedYet')}</span>;
        if (typeof d.captain === 'object') {
          const capObj = d.captain as any;
          return <span>{capObj.fullName || capObj.name || "Captain"}</span>;
        }
        return <span>{d.captain}</span>;
      }
    },
    {
      key: 'route',
      header: t('route'),
      render: (d: Delivery) => {
        const pickupRaw = d.pickupAddress || d.route.split("->")[0]?.trim() || "";
        const deliveryRaw = d.deliveryAddress || d.route.split("->")[1]?.trim() || "";

        const parseAddress = (addr: string) => {
          if (!addr) return { short: "", rest: "" };
          const parts = addr.split(',');
          const short = parts.slice(0, 2).join(',').trim();
          const rest = parts.slice(2).join(',').trim();
          return { short, rest };
        };

        const pickup = parseAddress(pickupRaw);
        const delivery = parseAddress(deliveryRaw);

        return (
          <div className="flex items-center gap-3 py-1 text-xs">
            {/* Pickup Node */}
            <div className="flex flex-col max-w-[220px]">
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {isRTL ? "الاستلام" : "Pickup"}
              </span>
              <span className="font-semibold text-[var(--color-text-main)] truncate max-w-[200px]" title={pickupRaw}>
                {pickup.short || pickupRaw}
              </span>
              {pickup.rest && (
                <span className="text-[10px] text-[var(--color-text-sub)] truncate max-w-[200px]" title={pickupRaw}>
                  {pickup.rest}
                </span>
              )}
            </div>

            {/* Connecting Arrow */}
            <div className="flex items-center justify-center text-zinc-400 shrink-0 mx-1">
              {isRTL ? "⬅️" : "➡️"}
            </div>

            {/* Delivery Node */}
            <div className="flex flex-col max-w-[220px]">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isRTL ? "التسليم" : "Delivery"}
              </span>
              <span className="font-semibold text-[var(--color-text-main)] truncate max-w-[200px]" title={deliveryRaw}>
                {delivery.short || deliveryRaw}
              </span>
              {delivery.rest && (
                <span className="text-[10px] text-[var(--color-text-sub)] truncate max-w-[200px]" title={deliveryRaw}>
                  {delivery.rest}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: t('status_col'),
      render: (d: Delivery) => {
        const item = STATUS_LABELS[d.status] || { en: d.status, ar: d.status, color: "blue" };
        const label = isRTL ? item.ar : item.en;
        return <Badge variant={item.color} dot>{label}</Badge>;
      }
    },
  ]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('deliveries_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('deliveries_sub')}</p>
      </div>
      <DataTable columns={columns} data={deliveries} keyField="id" />
    </div>
  )
}
