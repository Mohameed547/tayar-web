'use client'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import Card               from '@/shared/ui/Card'

export default function Performance() {
  const t = useCaptainTranslations()
  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('performance_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('performance_sub')}</p>
      </div>
      <Card>
        <p className="text-[13px] text-[var(--color-text-main)]">
          <strong>{t('topPerformer')}</strong>{' '}
          {t('topPerformerDetail')}
        </p>
      </Card>
    </div>
  )
}
