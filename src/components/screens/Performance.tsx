'use client'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/translations'
import Card               from '../Card'

export default function Performance() {
  const language = useAppSelector(s => s.ui.language)
  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('performance_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('performance_sub', language)}</p>
      </div>
      <Card>
        <p className="text-[13px] text-[var(--color-text-main)]">
          <strong>{t('topPerformer', language)}</strong>{' '}
          {t('topPerformerDetail', language)}
        </p>
      </Card>
    </div>
  )
}
