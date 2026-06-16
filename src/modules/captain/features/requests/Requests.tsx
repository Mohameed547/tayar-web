'use client'
import { useAppSelector }   from '@/store/hooks'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import { selectRequests } from '@/modules/captain/store/selectors'
import Card                 from '@/shared/ui/Card'
import Badge                from '@/shared/ui/Badge'

export default function Requests() {
  const t = useCaptainTranslations()
  const requests = useAppSelector(selectRequests)

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
          {t('requests_title')}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('requests_sub')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {requests.map(req => (
          <Card key={req.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="blue">{req.id}</Badge>
                <span className="text-[12px] text-[var(--color-text-sub)]">
                  📦 {req.packageType} ({req.weight})
                </span>
              </div>
              <button className="px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors self-start sm:self-auto">
                {t('sendOffer')}
              </button>
            </div>
            <div className="text-[13px] text-[var(--color-text-main)] space-y-1">
              <p><strong>{t('pickup')}:</strong> {req.pickup}</p>
              <p><strong>{t('dropoff')}:</strong> {req.dropoff}</p>
            </div>
            <p className="text-[11px] text-amber-500 mt-2">⏱ {t('expiresIn')} {req.expiresIn}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
