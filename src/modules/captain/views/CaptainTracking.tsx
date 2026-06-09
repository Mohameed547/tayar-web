'use client'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/i18n/translations'
import Card               from '@/shared/ui/Card'

export default function CaptainTracking() {
  const language = useAppSelector(s => s.ui.language)
  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('captainTracking_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('captainTracking_sub', language)}</p>
      </div>
      <Card className="h-[200px] flex items-center justify-center border-dashed">
        <div className="text-center">
          <div className="text-4xl mb-3">📡</div>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('captainTracking_map', language)}</p>
        </div>
      </Card>
    </div>
  )
}
