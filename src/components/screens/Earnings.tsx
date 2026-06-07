'use client'
import { useAppSelector } from '@/store/hooks'
import { t, type TranslationKey }              from '@/lib/translations'
import Card               from '../Card'

export default function Earnings() {
  const language = useAppSelector(s => s.ui.language)
  const earnings = useAppSelector(s => s.data.earnings)

  const items = [
    { labelKey: 'thisMonth',    value: earnings.thisMonth      },
    { labelKey: 'clearedPayouts', value: earnings.clearedPayouts },
    { labelKey: 'platformFees', value: earnings.platformFees   },
  ]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('earnings_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('earnings_sub', language)}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.labelKey}>
            <p className="text-[12px] text-[var(--color-text-sub)] mb-2">{t(item.labelKey as TranslationKey, language)}</p>
            <p className="text-[26px] font-extrabold text-[var(--color-text-main)]">
              EGP {item.value.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
