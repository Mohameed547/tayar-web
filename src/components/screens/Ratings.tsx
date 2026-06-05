'use client'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/translations'
import Card               from '../Card'

export default function Ratings() {
  const language = useAppSelector(s => s.ui.language)
  const rating   = useAppSelector(s => s.data.rating)

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('ratings_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('ratings_sub', language)}</p>
      </div>
      <Card>
        <p className="text-[24px] font-extrabold text-amber-500 mb-1">
          {rating.score} / 5.0 ★
        </p>
        <p className="text-[12px] text-[var(--color-text-sub)]">{t('ratingsBase', language)}</p>
      </Card>
    </div>
  )
}
