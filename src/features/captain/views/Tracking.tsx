'use client'
import { Check, Map } from 'lucide-react'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import Card               from '@/shared/ui/Card'

export default function Tracking() {
  const t = useCaptainTranslations()

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('tracking_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('tracking_sub')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Map placeholder */}
        <div className="bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-[14px] h-[250px] flex items-center justify-center">
          <div className="text-center">
            <Map className="mx-auto mb-3 h-10 w-10 text-blue-500" aria-hidden="true" />
            <p className="text-[13px] text-[var(--color-text-sub)]">{t('mapPlaceholder')}</p>
          </div>
        </div>

        <Card>
          <p className="text-[15px] font-bold text-[var(--color-text-main)] mb-4">{t('timeline_title')}</p>

          {/* Timeline */}
          <div className="relative pl-[26px] rtl:pl-0 rtl:pr-[26px]">
            <div className="absolute left-[9px] rtl:left-auto rtl:right-[9px] top-2 bottom-2 w-[2px] bg-[var(--color-border)]" />

            {/* Done */}
            <div className="relative mb-[18px]">
              <div className="absolute left-[-26px] rtl:left-auto rtl:right-[-26px] w-[18px] h-[18px] rounded-full border-2 border-green-500 bg-[var(--color-bg-card)] flex items-center justify-center">
                <Check size={9} className="text-green-500" />
              </div>
              <p className="text-[13px] font-semibold text-[var(--color-text-main)]">{t('tl_pickedUp')}</p>
            </div>

            {/* Active */}
            <div className="relative mb-[18px]">
              <div className="absolute left-[-26px] rtl:left-auto rtl:right-[-26px] w-[18px] h-[18px] rounded-full border-2 border-blue-600 bg-[var(--color-bg-card)]" />
              <p className="text-[13px] font-semibold text-blue-600">{t('tl_inTransit')}</p>
            </div>

            {/* Pending */}
            <div className="relative">
              <div className="absolute left-[-26px] rtl:left-auto rtl:right-[-26px] w-[18px] h-[18px] rounded-full border-2 border-[var(--color-border)] bg-[var(--color-bg-card)]" />
              <p className="text-[13px] font-semibold text-[var(--color-text-sub)]">{t('delivered')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
