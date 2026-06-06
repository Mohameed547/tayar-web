'use client'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/translations'
import DataTable          from '../DataTable'
import Badge              from '../Badge'
import type { Offer }     from '@/types'

const STATUS_BADGE: Record<Offer['status'], { variant: 'blue' | 'green' | 'red' | 'amber' | 'gray'; label_en: string; label_ar: string }> = {
  pending:  { variant: 'amber', label_en: 'Pending Response', label_ar: 'قيد الانتظار' },
  accepted: { variant: 'green', label_en: 'Accepted',         label_ar: 'مقبول'         },
  rejected: { variant: 'red',   label_en: 'Rejected',         label_ar: 'مرفوض'         },
  expired:  { variant: 'gray',  label_en: 'Expired',          label_ar: 'منتهية'         },
}

export default function Offers() {
  const language = useAppSelector(s => s.ui.language)
  const offers   = useAppSelector(s => s.data.offers)

  const columns = [
    { key: 'requestId', header: t('request_col', language), render: (o: Offer) => <span className="font-semibold text-[var(--color-text-main)]">{o.requestId}</span> },
    { key: 'quoteEGP',  header: t('yourQuote',   language), render: (o: Offer) => `EGP ${o.quoteEGP}` },
    {
      key: 'status', header: t('status_col', language),
      render: (o: Offer) => {
        const s = STATUS_BADGE[o.status]
        return <Badge variant={s.variant}>{language === 'ar' ? s.label_ar : s.label_en}</Badge>
      },
    },
  ]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('offers_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('offers_sub', language)}</p>
      </div>
      <DataTable columns={columns} data={offers} keyField="id" />
    </div>
  )
}
