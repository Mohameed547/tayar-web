'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setActiveScreen } from '@/features/captain/store/dashboard-slice'
import {
  selectAccountType,
  selectOrders,
  selectCaptains,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { useLocale } from 'next-intl'
import { assignShipmentToCaptain, reassignShipmentToCaptain, fetchCaptainDashboard, updateOrderStatus } from '@/features/captain'

export default function Orders() {
  const dispatch    = useAppDispatch()
  const t           = useCaptainTranslations()
  const accountType = useAppSelector(selectAccountType)
  const orders      = useAppSelector(selectOrders)
  const captains    = useAppSelector(selectCaptains)
  const locale      = useLocale()
  const isOffice    = accountType === 'office'

  const handleCaptainAssign = async (orderId: string, captainId: string, currentCaptain: any) => {
    if (!captainId) return
    try {
      if (currentCaptain) {
        await reassignShipmentToCaptain(orderId, captainId)
      } else {
        await assignShipmentToCaptain(orderId, captainId)
      }
      dispatch(fetchCaptainDashboard())
    } catch (err) {
      console.error('Failed to assign/reassign captain:', err)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: 'picked_up' | 'in_transit' | 'delivered') => {
    try {
      await updateOrderStatus(orderId, { status })
      dispatch(fetchCaptainDashboard())
    } catch (err) {
      console.error('Failed to update order status:', err)
    }
  }

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('orders_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('orders_sub')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map(order => {
          // Resolve currently selected captain ID by matching phone number
          const currentCaptainPhone = order.captain?.phone || (typeof order.captain === 'object' ? order.captain?.phone : null)
          const currentDriverId = currentCaptainPhone 
            ? (captains.find(cap => cap.phone === currentCaptainPhone)?.id || '') 
            : ''

          return (
            <Card key={order.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[14px] font-semibold text-[var(--color-text-main)]">Order {order.id}</h3>
                    {order.rawStatus === 'in_transit' && (
                      <Badge variant="blue">{locale === 'ar' ? 'قيد التوصيل' : 'In Transit'}</Badge>
                    )}
                    {order.rawStatus === 'picked_up' && (
                      <Badge variant="blue">{locale === 'ar' ? 'تم الاستلام' : 'Picked Up'}</Badge>
                    )}
                    {order.rawStatus === 'delivered' && (
                      <Badge variant="green">{locale === 'ar' ? 'تم التسليم' : 'Delivered'}</Badge>
                    )}
                    {(order.rawStatus === 'assigned' || order.rawStatus === 'captain_assignment' || !order.rawStatus) && (
                      <Badge variant="amber">{locale === 'ar' ? 'جاهز للاستلام' : 'Ready to Pickup'}</Badge>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-sub)] mt-1">
                    {t('clientConfirmed')} EGP {order.priceEGP}
                  </p>
                  {order.captain && (
                    <p className="text-[11px] text-emerald-500 mt-1 font-semibold">
                      👤 {locale === 'ar' ? 'الكابتن الحالي: ' : 'Current Captain: '}{typeof order.captain === 'object' ? (order.captain.fullName || order.captain.name) : order.captain}
                    </p>
                  )}
                </div>
                <div>
                  {isOffice ? (
                    (order.status === 'assigned' || order.status === 'pending_assignment') ? (
                      <div className="flex flex-col gap-1 min-w-[160px]">
                        <label className="text-[11px] text-[var(--color-text-sub)] font-semibold">
                          {locale === 'ar' ? 'تكليف كابتن:' : 'Assign Captain:'}
                        </label>
                        <select
                          value={currentDriverId}
                          onChange={(e) => handleCaptainAssign(order.id, e.target.value, order.captain)}
                          className="bg-zinc-950 border border-zinc-800 text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer text-white"
                        >
                          <option value="">{locale === 'ar' ? '-- اختر كابتن --' : '-- Choose Captain --'}</option>
                          {captains.map((cap) => {
                            const isCurrent = cap.id === currentDriverId;
                            const isAvailable = cap.status === 'available';
                            const isDisabled = !isCurrent && !isAvailable;
                            return (
                              <option 
                                key={cap.id} 
                                value={cap.id}
                                disabled={isDisabled}
                              >
                                {cap.name} ({t(cap.status)}){!isAvailable && !isCurrent ? ` - ${locale === 'ar' ? 'غير متاح' : 'Unavailable'}` : ''}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    ) : null
                  ) : (
                    <div className="flex gap-2">
                      {(order.rawStatus === 'assigned' || order.rawStatus === 'captain_assignment' || !order.rawStatus) && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                          className="px-3 py-[6px] bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-md transition-colors"
                        >
                          {t('pickUpCargo')}
                        </button>
                      )}
                      {order.rawStatus === 'picked_up' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                          className="px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors"
                        >
                          {t('startRoute')}
                        </button>
                      )}
                      {order.rawStatus === 'in_transit' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="px-3 py-[6px] bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-md transition-colors"
                        >
                          {t('markDelivered')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
