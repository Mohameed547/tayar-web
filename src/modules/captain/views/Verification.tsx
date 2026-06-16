'use client'
import { ShieldCheck }    from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import { selectVerification } from '@/modules/captain/store/selectors'

export default function Verification() {
  const t            = useCaptainTranslations()
  const verification = useAppSelector(selectVerification)

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('verification_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('verification_sub')}</p>
      </div>
      <div className="bg-[var(--color-bg-card)] border-l-4 border-green-500 rtl:border-l-0 rtl:border-r-4 border-t border-b border-r border-[var(--color-border)] rounded-[10px] p-5 max-w-lg">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-green-500" />
          <h3 className="text-[14px] font-semibold text-[var(--color-text-main)]">{t('accountVerified')}</h3>
        </div>
        <p className="text-[12px] text-[var(--color-text-sub)]">{verification.complianceText}</p>
      </div>
    </div>
  )
}
