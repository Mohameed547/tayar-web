'use client'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectRating } from '@/features/captain/store/selectors'
import Card               from '@/shared/ui/Card'

export default function Ratings() {
  const t = useCaptainTranslations()
  const rating = useAppSelector(selectRating)

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('ratings_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('ratings_sub')}</p>
      </div>
      <Card>
        <p className="text-[24px] font-extrabold text-amber-500 mb-1">
          {rating.score} / 5.0 ★
        </p>
        <p className="text-[12px] text-[var(--color-text-sub)]">{t('ratingsBase')}</p>
      </Card>
    </div>
  )
}
