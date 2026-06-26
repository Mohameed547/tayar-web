'use client'
import { useState } from 'react'
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
import { assignShipmentToCaptain, reassignShipmentToCaptain } from '@/features/office'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'
import { useLocale } from 'next-intl'

function OrderAssignmentControl({ order, captains, isRTL }: { order: any; captains: any[]; isRTL: boolean }) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const captainId = e.target.value
    if (!captainId) return

    setLoading(true)
    setErrorMsg('')
    try {
      if (order.status === 'pending_assignment') {
        await assignShipmentToCaptain(order.id, captainId)
      } else {
        await reassignShipmentToCaptain(order.id, captainId)
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
    <div className="flex flex-col gap-1 items-end">
      {errorMsg && (
        <span className="text-[10px] text-red-400 font-medium mb-1 max-w-[200px] text-right">
          {errorMsg}
        </span>
      )}
      <div className="flex items-center gap-2">
        {loading && (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
        )}
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

export default function Orders() {
  const dispatch    = useAppDispatch()
  const t           = useCaptainTranslations()
  const accountType = useAppSelector(selectAccountType)
  const orders      = useAppSelector(selectOrders)
  const captains    = useAppSelector(selectCaptains)
  const locale      = useLocale()
  const isRTL        = locale === 'ar'
  const isOffice    = accountType === 'office'

  const getStatusBadge = (status: string, captainName?: string) => {
    switch (status) {
      case 'pending_assignment':
        return <Badge variant="amber">{isRTL ? 'في انتظار التعيين' : 'Pending Assignment'}</Badge>
      case 'assigned':
        return (
          <Badge variant="blue">
            {isRTL ? `تم التعيين: ${captainName || ''}` : `Assigned to: ${captainName || 'Captain'}`}
          </Badge>
        )
      case 'in_progress':
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
                    {getStatusBadge(order.status, order.captain?.name)}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-sub)]">
                    {t('clientConfirmed')} EGP {order.priceEGP}
                  </p>
                  {order.captain && (
                    <p className="text-[11px] text-[var(--color-text-sub)] mt-1">
                      {isRTL ? 'الهاتف: ' : 'Phone: '} {order.captain.phone}
                    </p>
                  )}
                </div>
                <div>
                  {isOffice ? (
                    <OrderAssignmentControl order={order} captains={captains} isRTL={isRTL} />
                  ) : (
                    <button className="px-3 py-[6px] bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-md transition-colors">
                      {t('pickUpCargo')}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
