'use client'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import Card               from '@/shared/ui/Card'

export default function CaptainTracking() {
  const t = useCaptainTranslations()
  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('captainTracking_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('captainTracking_sub')}</p>
      </div>
      <Card className="h-[200px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <div className="text-4xl mb-3">📡</div>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('captainTracking_map')}</p>
        </div>
      </Card>
    </div>
  )
}
