'use client'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setActiveScreen, setOnlineState } from '@/features/captain/store/dashboard-slice'
import {
  selectAccountType,
  selectOrders,
  selectCaptains,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { assignShipmentToCaptain, reassignShipmentToCaptain, updateDriverAvailability } from '@/features/office'
import { updateOrderStatus, acceptAssignment, rejectAssignment } from '@/features/shipments'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'
import { useLocale } from 'next-intl'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-zinc-950 flex items-center justify-center text-xs text-zinc-550 font-semibold border border-zinc-800 rounded-xl mt-3">
      Loading Route Map...
    </div>
  ),
})

function OrderAssignmentControl({ order, captains, isRTL }: { order: any; captains: any[]; isRTL: boolean }) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [discount, setDiscount] = useState<number>(0)

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const captainId = e.target.value
    if (!captainId) return

    setLoading(true)
    setErrorMsg('')
    try {
      if (order.status === 'pending_assignment') {
        await assignShipmentToCaptain(order.id, captainId, discount)
      } else {
        await reassignShipmentToCaptain(order.id, captainId, discount)
      }
      dispatch(fetchCaptainDashboard('office'))
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  // Filter out offline captains, and sort available captains first
  const activeCaptains = captains.filter(c => c.status !== 'offline')
  const sortedCaptains = [...activeCaptains].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1
    if (a.status !== 'available' && b.status === 'available') return 1
    return 0
  })

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {errorMsg && (
        <span className="text-[10px] text-red-400 font-medium mb-1 max-w-[200px] text-right">
          {errorMsg}
        </span>
      )}
      <div className="flex items-center gap-2">
        {loading && (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
        )}

        {/* Discount input field */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
          <span className="text-[10px] text-zinc-400 font-medium">{isRTL ? 'خصم %' : 'Discount %'}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
            disabled={loading || order.status === 'in_progress' || order.status === 'delivered'}
            className="w-12 bg-transparent text-xs font-semibold text-zinc-100 outline-none text-center"
          />
        </div>

        <select
          value={order.captain?.id || ""}
          disabled={loading || order.status === 'in_progress' || order.status === 'delivered'}
          onChange={handleAssign}
          className="bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-100 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
        >
          <option value="">
            {order.status === 'pending_assignment'
              ? (isRTL ? 'اختر كابتن للتعيين...' : 'Select Captain to Assign...')
              : (isRTL ? 'إعادة تعيين كابتن...' : 'Reassign Captain...')}
          </option>
          {sortedCaptains.map((cap) => (
            <option key={cap.id} value={cap.id}>
              {cap.name} ({cap.status === 'available' ? (isRTL ? 'متاح' : 'Available') : (isRTL ? 'مشغول' : 'Busy')})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function CaptainOrderActionControl({ order, isRTL, t }: { order: any; isRTL: boolean; t: any }) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const currentStatus = order.rawStatus || order.status;

  const handleAcceptAssignment = async () => {
    setLoading(true)
    try {
      await acceptAssignment(order.id)
      dispatch(fetchCaptainDashboard('captain'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectAssignment = async () => {
    setLoading(true)
    try {
      await rejectAssignment(order.id)
      dispatch(fetchCaptainDashboard('captain'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (order.captainStatus === 'pending') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleAcceptAssignment}
          disabled={loading}
          className="px-3 py-[6px] bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading && (
            <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
          )}
          {isRTL ? 'قبول العرض' : 'Accept Offer'}
        </button>
        <button
          onClick={handleRejectAssignment}
          disabled={loading}
          className="px-3 py-[6px] bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading && (
            <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
          )}
          {isRTL ? 'رفض العرض' : 'Reject Offer'}
        </button>
      </div>
    )
  }

  if (currentStatus === 'delivered') {
    return null
  }

  const handleAction = async () => {
    setLoading(true)
    try {
      let nextStatus = 'delivered';
      if (currentStatus === 'assigned' || currentStatus === 'captain_assignment') {
        nextStatus = 'picked_up';
      } else if (currentStatus === 'picked_up') {
        nextStatus = 'in_transit';
      } else if (currentStatus === 'in_transit' || currentStatus === 'out_for_delivery') {
        nextStatus = 'delivered';
      }

      await updateOrderStatus(order.id, { status: nextStatus as any })
      if (nextStatus === 'delivered') {
        dispatch(setOnlineState(true))
        try {
          await updateDriverAvailability('available')
        } catch (dbErr) {
          console.error("Failed to update captain status in DB:", dbErr)
        }
      }
      dispatch(fetchCaptainDashboard('captain'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  let buttonText = t('markDelivered')
  let buttonBg = 'bg-blue-600 hover:bg-blue-700'

  if (currentStatus === 'assigned' || currentStatus === 'captain_assignment') {
    buttonText = t('pickUpCargo')
    buttonBg = 'bg-green-600 hover:bg-green-700'
  } else if (currentStatus === 'picked_up') {
    buttonText = t('startRoute')
    buttonBg = 'bg-amber-600 hover:bg-amber-700'
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className={`px-3 py-[6px] ${buttonBg} text-white text-[12px] font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50`}
    >
      {loading && (
        <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
      )}
      {buttonText}
    </button>
  )
}

export default function Orders() {
  const dispatch = useAppDispatch()
  const t = useCaptainTranslations()
  const accountType = useAppSelector(selectAccountType)
  const orders = useAppSelector(selectOrders)
  const captains = useAppSelector(selectCaptains)
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const isOffice = accountType === 'office'
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null)

  const getStatusBadge = (status: string, captainName?: string, rawStatus?: string, captainStatus?: string) => {
    const finalStatus = rawStatus || status;
    if (captainStatus === 'pending') {
      return <Badge variant="amber">{isRTL ? 'عرض معلق' : 'Offer Pending'}</Badge>
    }
    if (captainStatus === 'rejected') {
      return <Badge variant="red">{isRTL ? 'مرفوض من الكابتن' : 'Rejected by Captain'}</Badge>
    }
    switch (finalStatus) {
      case 'pending_assignment':
        return <Badge variant="amber">{isRTL ? 'في انتظار التعيين' : 'Pending Assignment'}</Badge>
      case 'assigned':
        return (
          <Badge variant="blue">
            {isRTL ? `تم التعيين: ${captainName || ''}` : `Assigned to: ${captainName || 'Captain'}`}
          </Badge>
        )
      case 'picked_up':
        return <Badge variant="amber">{isRTL ? 'تم الاستلام' : 'Picked Up'}</Badge>
      case 'in_progress':
      case 'in_transit':
        return <Badge variant="green">{isRTL ? 'قيد التوصيل' : 'In Progress'}</Badge>
      case 'delivered':
        return <Badge variant="gray">{isRTL ? 'تم التوصيل' : 'Delivered'}</Badge>
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('orders_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('orders_sub')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--color-text-sub)] bg-zinc-900/20 border border-zinc-800/40 rounded-xl">
            {isRTL ? 'لا توجد طلبيات حالية' : 'No current orders'}
          </div>
        ) : (
          orders.map(order => (
            <Card key={order.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-[14px] font-semibold text-[var(--color-text-main)]">
                      {isRTL ? 'شحنة رقم' : 'Order'} #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    {getStatusBadge(order.status, order.captain?.name, order.rawStatus, order.captainStatus)}
                  </div>
                  {order.captainPrice !== undefined && order.captainPrice !== null ? (
                    <p className="text-[12px] text-[var(--color-text-sub)]">
                      {isRTL ? 'قيمة التوصيل: ' : 'Payout: '} <span className="text-green-400 font-bold">EGP {order.captainPrice}</span>
                    </p>
                  ) : (
                    <p className="text-[12px] text-[var(--color-text-sub)]">
                      {t('clientConfirmed')} EGP {order.priceEGP}
                    </p>
                  )}
                  {isOffice ? (
                    order.captain && (
                      <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                        {isRTL ? 'الهاتف: ' : 'Phone: '} {order.captain.phone}
                      </p>
                    )
                  ) : (
                    order.clientPhone && (
                      <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                        {isRTL ? 'الهاتف: ' : 'Phone: '} {order.clientPhone}
                      </p>
                    )
                  )}
                </div>
                <div>
                  {isOffice ? (
                    <OrderAssignmentControl order={order} captains={captains} isRTL={isRTL} />
                  ) : (
                    <CaptainOrderActionControl order={order} isRTL={isRTL} t={t} />
                  )}
                </div>
              </div>

              {/* Collapsible Route Map for Captain */}
              {order.pickupCoords && order.deliveryCoords && (
                (order.status as string) === 'assigned' ||
                (order.status as string) === 'picked_up' ||
                (order.status as string) === 'in_progress' ||
                (order.status as string) === 'in_transit' ||
                (order.status as string) === 'delivered' ||
                order.rawStatus === 'assigned' ||
                order.rawStatus === 'picked_up' ||
                order.rawStatus === 'in_progress' ||
                order.rawStatus === 'in_transit' ||
                order.rawStatus === 'delivered'
              ) && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-col gap-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <button
                        onClick={() => setExpandedMapId(expandedMapId === order.id ? null : order.id)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        🗺️ {expandedMapId === order.id ? (isRTL ? 'إخفاء الخريطة' : 'Hide Map') : (isRTL ? 'عرض مسار التوصيل' : 'Show Route Map')}
                      </button>

                      <div className="flex gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.pickupCoords[0] > order.pickupCoords[1] ? order.pickupCoords[1] : order.pickupCoords[0]},${order.pickupCoords[0] > order.pickupCoords[1] ? order.pickupCoords[0] : order.pickupCoords[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded transition-colors uppercase tracking-wider"
                        >
                          🚀 {isRTL ? 'ملاحة للاستلام' : 'Navigate to Pickup'}
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryCoords[0] > order.deliveryCoords[1] ? order.deliveryCoords[1] : order.deliveryCoords[0]},${order.deliveryCoords[0] > order.deliveryCoords[1] ? order.deliveryCoords[0] : order.deliveryCoords[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-extrabold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded transition-colors uppercase tracking-wider"
                        >
                          🚀 {isRTL ? 'ملاحة للتسليم' : 'Navigate to Delivery'}
                        </a>
                      </div>
                    </div>

                    {expandedMapId === order.id && (
                      <div className="rounded-lg overflow-hidden border border-zinc-800">
                        <MapView
                          pickupCoords={order.pickupCoords[0] > order.pickupCoords[1] ? [order.pickupCoords[1], order.pickupCoords[0]] : [order.pickupCoords[0], order.pickupCoords[1]]}
                          deliveryCoords={order.deliveryCoords[0] > order.deliveryCoords[1] ? [order.deliveryCoords[1], order.deliveryCoords[0]] : [order.deliveryCoords[0], order.deliveryCoords[1]]}
                          zoom={12}
                          height="250px"
                        />
                      </div>
                    )}
                  </div>
                )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
