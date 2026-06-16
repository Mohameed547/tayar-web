'use client'
import { TrendingUp, Inbox } from 'lucide-react'
import { useAppSelector }    from '@/store/hooks'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import {
  selectAccountType,
  selectEarnings,
  selectRequests,
} from '@/modules/captain/store/selectors'
import MetricCard            from '@/shared/ui/MetricCard'
import Card                  from '@/shared/ui/Card'
import Badge                 from '@/shared/ui/Badge'

export default function Overview() {
  const t           = useCaptainTranslations()
  const accountType = useAppSelector(selectAccountType)
  const earnings    = useAppSelector(selectEarnings)
  const requests    = useAppSelector(selectRequests)
  const isOffice    = accountType === 'office'
  const latestReq   = requests[0]

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
          <MetricCard value="12" label={t('activeDeliveries')} />
        )}
        <MetricCard value={String(requests.length)} label={t('newRequests')} />
        <MetricCard value="4.9" label={t('ratingScore')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
            <Inbox size={16} className="text-blue-600" />
            {t('latestRequest')}
          </div>
          {latestReq ? (
            <div className="bg-[var(--color-bg-muted)] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-[6px]">
                <strong className="text-[13px] text-[var(--color-text-main)]">{latestReq.id}</strong>
                <Badge variant="amber">{t('expiresIn')} {latestReq.expiresIn}</Badge>
              </div>
              <p className="text-[12px] text-[var(--color-text-sub)]">{latestReq.route} ({latestReq.weight})</p>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--color-text-sub)]">{t('noActiveRequests')}</p>
          )}
        </Card>

        {isOffice && (
          <Card>
            <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
              <TrendingUp size={16} className="text-green-500" />
              {t('captainsStatus')}
            </div>
            <p className="text-[13px] text-[var(--color-text-sub)]">{t('captainsOnline')}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
