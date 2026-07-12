'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, Inbox } from 'lucide-react'
import { useAppSelector }    from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { useLocale } from 'next-intl'
import {
  selectAccountType,
  selectEarnings,
  selectRequests,
  selectRating,
  selectCaptains,
  selectDeliveries,
} from '@/features/captain/store/selectors'
import MetricCard            from '@/shared/ui/MetricCard'
import Card                  from '@/shared/ui/Card'
import Badge                 from '@/shared/ui/Badge'
import api from '@/lib/api/client'

export default function Overview() {
  const t           = useCaptainTranslations()
  const locale      = useLocale()
  const accountType = useAppSelector(selectAccountType)
  const earnings    = useAppSelector(selectEarnings)
  const requests    = useAppSelector(selectRequests)
  const rating      = useAppSelector(selectRating)
  const captains    = useAppSelector(selectCaptains)
  const deliveries  = useAppSelector(selectDeliveries)
  const isOffice    = accountType === 'office'
  const latestReq   = requests[0]

  const activeDeliveriesCount = deliveries.filter(d => 
    d.status !== 'delivered' && d.status !== 'cancelled' && d.status !== 'returned'
  ).length

  const onlineCount = captains.filter(c => c.status !== 'offline').length
  const busyCount   = captains.filter(c => c.status === 'busy').length

  const statusSummary = locale === 'ar'
    ? `${onlineCount} كباتن متصلون · ${busyCount} في التوصيل`
    : `${onlineCount} Captains Online · ${busyCount} On Delivery`

  const [invitations, setInvitations] = useState<any[]>([])
  const [loadingInv, setLoadingInv] = useState(false)

  const fetchInvitations = async () => {
    if (isOffice) return
    setLoadingInv(true)
    try {
      const response = await api.get('/api/captain-dashboard/invitations')
      setInvitations(response.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
    } finally {
      setLoadingInv(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [isOffice])

  const handleAccept = async (invitationId: string) => {
    try {
      await api.post(`/api/captain-dashboard/invitations/${invitationId}/accept`)
      fetchInvitations()
      // Refresh to reflect the new associated offices
      window.location.reload()
    } catch (err) {
      console.error('Failed to accept invitation:', err)
    }
  }

  const handleReject = async (invitationId: string) => {
    try {
      await api.post(`/api/captain-dashboard/invitations/${invitationId}/reject`)
      fetchInvitations()
    } catch (err) {
      console.error('Failed to reject invitation:', err)
    }
  }

  const displayRating = rating && rating.averageRating && rating.averageRating > 0
    ? rating.averageRating.toFixed(1)
    : "5.0"


  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
          {t('overview_title')}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('overview_sub')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-[22px]">
        <MetricCard
          value={`EGP ${earnings.todayEarnings.toLocaleString()}`}
          label={t('todayEarnings')}
          change="+14%"
          changeUp
        />
        {isOffice && (
          <MetricCard value={String(activeDeliveriesCount)} label={t('activeDeliveries')} />
        )}
        <MetricCard value={String(requests.length)} label={t('newRequests')} />
        <MetricCard value={displayRating} label={t('ratingScore')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
            <Inbox size={16} className="text-blue-600" />
            {t('latestRequest')}
          </div>
          {latestReq ? (
            <div className="bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-4">
              {/* Header: ID, Expiration and Price */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border)]/50">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[var(--color-text-sub)] uppercase tracking-wider font-semibold">
                    {locale === 'ar' ? 'رقم التتبع' : 'Tracking Number'}
                  </span>
                  <strong className="text-[13px] text-[var(--color-text-main)] font-bold">
                    {latestReq.trackingNumber || latestReq.id}
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  {latestReq.expiresIn && (
                    <Badge variant="amber">{t('expiresIn')} {latestReq.expiresIn}</Badge>
                  )}
                  {latestReq.price && (
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      {latestReq.price} EGP
                    </div>
                  )}
                </div>
              </div>

              {/* Route: Pickup and Dropoff visual indicator */}
              <div className="flex flex-col gap-2 relative pl-3.5 rtl:pl-0 rtl:pr-3.5">
                {/* Vertical connecting line */}
                <div className="absolute left-[7px] rtl:left-auto rtl:right-[7px] top-[14px] bottom-[14px] w-[1.5px] bg-dashed border-l border-zinc-300 dark:border-zinc-700" />
                
                {/* Pickup */}
                <div className="flex items-start gap-2.5">
                  <div className="h-4.5 w-4.5 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center shrink-0 mt-0.5 z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--color-text-sub)] font-semibold">
                      {locale === 'ar' ? 'نقطة الاستلام' : 'Pickup Address'}
                    </span>
                    <span className="text-xs text-[var(--color-text-main)] font-semibold line-clamp-1">
                      {latestReq.pickup}
                    </span>
                  </div>
                </div>

                {/* Dropoff */}
                <div className="flex items-start gap-2.5">
                  <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5 z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--color-text-sub)] font-semibold">
                      {locale === 'ar' ? 'وجهة التسليم' : 'Delivery Address'}
                    </span>
                    <span className="text-xs text-[var(--color-text-main)] font-semibold line-clamp-1">
                      {latestReq.dropoff}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Chips */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--color-border)]/50">
                <span className="text-[10px] font-semibold bg-[var(--color-bg-card)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg text-[var(--color-text-main)] flex items-center gap-1.5">
                  📦 {latestReq.packageType || (locale === 'ar' ? 'طرد' : 'Package')}
                </span>
                <span className="text-[10px] font-semibold bg-[var(--color-bg-card)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg text-[var(--color-text-main)] flex items-center gap-1.5">
                  ⚖️ {latestReq.weight}
                </span>
                {latestReq.deliverySpeed && (
                  <span className="text-[10px] font-semibold bg-[var(--color-bg-card)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg text-[var(--color-text-main)] flex items-center gap-1.5">
                    ⚡ {latestReq.deliverySpeed}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--color-text-sub)]">{t('noActiveRequests')}</p>
          )}
        </Card>

        {isOffice ? (
          <Card>
            <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
              <TrendingUp size={16} className="text-green-500" />
              {t('captainsStatus')}
            </div>
            <p className="text-[13px] text-[var(--color-text-sub)] font-semibold mb-3">{statusSummary}</p>
            
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto mt-2 pr-1">
              {captains.length > 0 ? (
                captains.slice(0, 5).map((cap, idx) => (
                  <div key={`${cap.id}-${idx}`} className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-bg-muted)] border border-[var(--color-border)]/60 hover:bg-[var(--color-bg-muted)]/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${
                        cap.status === 'available' ? 'bg-emerald-500 animate-pulse' :
                        cap.status === 'busy' ? 'bg-amber-500' : 'bg-zinc-500'
                      }`} />
                      <span className="text-xs font-semibold text-[var(--color-text-main)]">{cap.name}</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-sub)] font-bold uppercase">
                      {cap.status === 'available' ? (locale === 'ar' ? 'متاح' : 'Available') :
                       cap.status === 'busy' ? (locale === 'ar' ? 'في التوصيل' : 'On Delivery') :
                       (locale === 'ar' ? 'غير متصل' : 'Offline')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-text-sub)] italic">
                  {locale === 'ar' ? 'لا يوجد كباتن مسجلين' : 'No registered captains'}
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
              <TrendingUp size={16} className="text-emerald-500" />
              {locale === 'ar' ? 'دعوات المكاتب' : 'Office Invitations'}
            </div>
            {loadingInv ? (
              <div className="flex justify-center items-center py-4">
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
              </div>
            ) : invitations.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {invitations.map((inv, idx) => (
                  <div key={`${inv.id}-${idx}`} className="bg-[var(--color-bg-muted)] p-3 rounded-xl border border-[var(--color-border)] flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-text-main)]">{inv.officeName}</h4>
                        <p className="text-[10px] text-[var(--color-text-sub)] mt-0.5">{inv.officeEmail} | {inv.officePhone}</p>
                      </div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        {locale === 'ar' ? 'معلقة' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleAccept(inv.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors focus:outline-none"
                      >
                        {locale === 'ar' ? 'قبول' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleReject(inv.id)}
                        className="flex-1 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 text-[11px] font-bold rounded-lg transition-colors focus:outline-none"
                      >
                        {locale === 'ar' ? 'رفض' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--color-text-sub)]">
                {locale === 'ar' ? 'لا توجد دعوات انضمام معلقة حالياً.' : 'No pending office invitations at the moment.'}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
