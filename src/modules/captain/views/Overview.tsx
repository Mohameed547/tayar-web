'use client'
import { TrendingUp, Inbox } from 'lucide-react'
import { useAppSelector }    from '@/store/hooks'
import { t }                 from '@/lib/i18n/translations'
import MetricCard            from '@/shared/ui/MetricCard'
import Card                  from '@/shared/ui/Card'
import Badge                 from '@/shared/ui/Badge'

export default function Overview() {
  const language    = useAppSelector(s => s.ui.language)
  const accountType = useAppSelector(s => s.ui.accountType)
  const earnings    = useAppSelector(s => s.data.earnings)
  const requests    = useAppSelector(s => s.data.requests)
  const isOffice    = accountType === 'office'
  const latestReq   = requests[0]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
          {t('overview_title', language)}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('overview_sub', language)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-[22px]">
        <MetricCard
          value={`EGP ${earnings.todayEarnings.toLocaleString()}`}
          label={t('todayEarnings', language)}
          change="+14%"
          changeUp
        />
        {isOffice && (
          <MetricCard value="12" label={t('activeDeliveries', language)} />
        )}
        <MetricCard value={String(requests.length)} label={t('newRequests', language)} />
        <MetricCard value="4.9" label={t('ratingScore', language)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
            <Inbox size={16} className="text-blue-600" />
            {t('latestRequest', language)}
          </div>
          {latestReq ? (
            <div className="bg-[var(--color-bg-muted)] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-[6px]">
                <strong className="text-[13px] text-[var(--color-text-main)]">{latestReq.id}</strong>
                <Badge variant="amber">{t('expiresIn', language)} {latestReq.expiresIn}</Badge>
              </div>
              <p className="text-[12px] text-[var(--color-text-sub)]">{latestReq.route} ({latestReq.weight})</p>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--color-text-sub)]">No active requests</p>
          )}
        </Card>

        {isOffice && (
          <Card>
            <div className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-text-main)] mb-3">
              <TrendingUp size={16} className="text-green-500" />
              {t('captainsStatus', language)}
            </div>
            <p className="text-[13px] text-[var(--color-text-sub)]">{t('captainsOnline', language)}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
