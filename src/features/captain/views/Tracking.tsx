'use client'

import { useState, useEffect } from 'react'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { getCaptainOrders } from '@/features/shipments/api/captain-api'
import { getTrackingDetails } from '@/features/tracking/api'
import type { ProviderOrder } from '@/features/shipments/types'
import dynamic from 'next/dynamic'
import { Map, Shield, User, Phone, MapPin, Navigation, RefreshCw, CheckCircle2, Circle } from 'lucide-react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

const MapView = dynamic(() => import("@/shared/ui/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-zinc-950 flex items-center justify-center text-sm text-zinc-500 font-semibold border border-zinc-800 rounded-xl">
      Loading Shipment Route Map...
    </div>
  ),
})

export default function Tracking() {
  const t = useCaptainTranslations()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const [orders, setOrders] = useState<ProviderOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<ProviderOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchOrders = async () => {
    try {
      const data = await getCaptainOrders('office')
      // Only track active/undelivered orders
      const active = data.filter(o => o.rawStatus !== 'delivered' && o.status !== 'delivered')
      setOrders(active)
      
      // Keep selected order updated
      if (selectedOrder) {
        const updated = active.find(o => o.id === selectedOrder.id)
        if (updated) setSelectedOrder(updated)
      } else if (active.length > 0) {
        setSelectedOrder(active[0])
      }
    } catch (err) {
      console.error("Failed to load office orders for tracking:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [selectedOrder])

  const [captainCoords, setCaptainCoords] = useState<[number, number] | undefined>(undefined)

  useEffect(() => {
    if (!selectedOrder) {
      setCaptainCoords(undefined)
      return
    }

    const fetchLiveLocation = async () => {
      try {
        const details = await getTrackingDetails(selectedOrder.id)
        if (details && details.currentLocation?.coords) {
          const [lng, lat] = details.currentLocation.coords
          if (!isNaN(lat) && !isNaN(lng)) {
            setCaptainCoords([lat, lng])
          }
        }
      } catch (err) {
        console.error("Failed to fetch live location for tracking:", err)
      }
    }

    fetchLiveLocation()
    
    const activeStatuses = ['picked_up', 'in_transit', 'in_progress', 'out_for_delivery']
    const rawStatus = selectedOrder.rawStatus || selectedOrder.status
    if (activeStatuses.includes(rawStatus)) {
      const interval = setInterval(fetchLiveLocation, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedOrder])

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.captain?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCoordinates = (coords?: [number, number]): [number, number] | undefined => {
    if (!coords || coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) return undefined
    return [coords[1], coords[0]] // Swap GeoJSON [lng, lat] to Leaflet [lat, lng]
  }

  const pickupCoords = selectedOrder ? getCoordinates(selectedOrder.pickupCoords) : undefined
  const deliveryCoords = selectedOrder ? getCoordinates(selectedOrder.deliveryCoords) : undefined

  // Timeline logic
  const getTimelineSteps = (order: ProviderOrder) => {
    const rawStatus = order.rawStatus || order.status
    const steps = [
      {
        key: 'created',
        label: isRTL ? 'تم إنشاء الشحنة' : 'Shipment Created',
        done: true,
      },
      {
        key: 'assigned',
        label: isRTL ? 'تم تعيين كابتن' : 'Captain Assigned',
        done: ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(rawStatus) && !!order.captain,
      },
      {
        key: 'picked_up',
        label: isRTL ? 'تم استلام الشحنة' : 'Cargo Picked Up',
        done: ['picked_up', 'in_transit', 'delivered'].includes(rawStatus),
      },
      {
        key: 'in_transit',
        label: isRTL ? 'جاري التوصيل' : 'In Transit',
        done: ['in_transit', 'delivered'].includes(rawStatus),
      },
      {
        key: 'delivered',
        label: isRTL ? 'تم التسليم' : 'Delivered',
        done: rawStatus === 'delivered',
      }
    ]
    return steps
  }

  const getStatusBadge = (order: ProviderOrder) => {
    const rawStatus = order.rawStatus || order.status
    switch (rawStatus) {
      case 'pending_assignment':
        return <Badge variant="amber">{isRTL ? 'في انتظار التعيين' : 'Pending Assignment'}</Badge>
      case 'assigned':
        return <Badge variant="blue">{isRTL ? 'تم التعيين' : 'Assigned'}</Badge>
      case 'picked_up':
        return <Badge variant="amber">{isRTL ? 'تم الاستلام' : 'Picked Up'}</Badge>
      case 'in_transit':
        return <Badge variant="green">{isRTL ? 'قيد التوصيل' : 'In Transit'}</Badge>
      default:
        return <Badge variant="gray">{rawStatus}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 text-zinc-100">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
            {t('tracking_title')}
          </h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">
            {isRTL ? 'تتبع حالة الشحنات النشطة ومسار رحلتها الجارية حالياً.' : 'Trace customer cargo lifecycle and map updates.'}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchOrders()
          }}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Active Shipments list */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 min-h-[500px]">
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "بحث برقم الطلب أو اسم الكابتن..." : "Search Order ID or captain name..."}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] flex flex-col gap-2 pr-1">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-900/50 border border-zinc-850 rounded-lg animate-pulse" />
              ))
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                {isRTL ? "لا توجد شحنات نشطة حالياً لتتبعها" : "No active shipments available to track."}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={cn(
                    "w-full text-left rtl:text-right p-3 rounded-lg border transition-all duration-200 flex flex-col gap-1.5",
                    selectedOrder?.id === order.id
                      ? "bg-blue-600/10 border-blue-500/50"
                      : "bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900/50 hover:border-zinc-800"
                  )}
                >
                  <div className="flex justify-between items-center w-full gap-2">
                    <span className="text-xs font-bold text-zinc-200">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    {getStatusBadge(order)}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate w-full">
                    {order.pickupAddress?.split(',')[0]} ➔ {order.deliveryAddress?.split(',')[0]}
                  </div>
                  {order.captain && (
                    <div className="text-[9px] text-blue-400 font-semibold mt-0.5">
                      🚚 {order.captain.name}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Map & Live Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {selectedOrder ? (
            <div className="flex flex-col gap-4">
              {/* Info Details Header */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      {isRTL ? 'تتبع شحنة رقم' : 'Tracking Order'} #{selectedOrder.id.slice(-6).toUpperCase()}
                      {getStatusBadge(selectedOrder)}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      ID: {selectedOrder.id}
                    </p>
                  </div>
                  <div className="text-right rtl:text-left">
                    <span className="text-xs text-zinc-500 block">
                      {isRTL ? 'تكلفة التوصيل' : 'Delivery Price'}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      EGP {selectedOrder.priceEGP}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-850/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-bold text-zinc-400">{isRTL ? 'العميل' : 'Client'}:</span>
                      <span className="text-zinc-200">{selectedOrder.clientName}</span>
                    </div>
                    {selectedOrder.clientPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="font-bold text-zinc-400">{isRTL ? 'الهاتف' : 'Phone'}:</span>
                        <span className="text-zinc-200">{selectedOrder.clientPhone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-2.5 md:pt-0 md:pl-3 rtl:md:border-l-0 rtl:md:border-r rtl:md:pl-0 rtl:md:pr-3">
                    {selectedOrder.captain ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="font-bold text-zinc-400">{isRTL ? 'الكابتن المعين' : 'Assigned Captain'}:</span>
                          <span className="text-zinc-200">{selectedOrder.captain.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="font-bold text-zinc-400">{isRTL ? 'هاتف الكابتن' : 'Captain Phone'}:</span>
                          <span className="text-zinc-200">{selectedOrder.captain.phone}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-amber-500 italic py-1">
                        ⚠️ {isRTL ? 'لم يتم تعيين كابتن بعد' : 'No captain assigned yet.'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-1 mt-1 text-zinc-400">
                  <div>
                    <span className="font-bold text-zinc-500">{isRTL ? 'موقع الاستلام' : 'Pickup'}:</span> {selectedOrder.pickupAddress}
                  </div>
                  <div>
                    <span className="font-bold text-zinc-500">{isRTL ? 'موقع التسليم' : 'Delivery'}:</span> {selectedOrder.deliveryAddress}
                  </div>
                </div>
              </div>

              {/* Map */}
              <MapView
                pickupCoords={pickupCoords}
                deliveryCoords={deliveryCoords}
                captainCoords={captainCoords}
                zoom={12}
                height="350px"
              />

              {/* Timeline Progress */}
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  {isRTL ? 'الجدول الزمني ومراحل الشحن' : 'Shipment Timeline Progress'}
                </h3>
                <div className="flex flex-col gap-4 pl-2 rtl:pl-0 rtl:pr-2">
                  {getTimelineSteps(selectedOrder).map((step, idx) => (
                    <div key={step.key} className="flex items-center gap-3 relative">
                      {idx < getTimelineSteps(selectedOrder).length - 1 && (
                        <div 
                          className={cn(
                            "absolute left-2.5 rtl:left-auto rtl:right-2.5 top-6 bottom-[-16px] w-[2px]",
                            step.done ? "bg-blue-500" : "bg-zinc-800"
                          )} 
                        />
                      )}
                      {step.done ? (
                        <CheckCircle2 className="h-5.5 w-5.5 text-blue-500 shrink-0" />
                      ) : (
                        <Circle className="h-5.5 w-5.5 text-zinc-700 shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs font-semibold",
                        step.done ? "text-zinc-200" : "text-zinc-500"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-8 border-dashed min-h-[450px]">
              <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl mb-4 shadow-inner">
                📍
              </div>
              <h3 className="text-sm font-bold text-zinc-300 mb-1">
                {isRTL ? "اختر شحنة للمتابعة" : "Select a Shipment"}
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                {isRTL
                  ? "انقر على أي شحنة نشطة من القائمة الجانبية اليسرى لعرض مسارها الجغرافي المباشر وجدولها الزمني."
                  : "Click on any active shipment from the list on the left to track its live route and timeline."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
