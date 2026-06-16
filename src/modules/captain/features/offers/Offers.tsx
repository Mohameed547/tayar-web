'use client'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import { selectOffers } from '@/modules/captain/store/selectors'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { ProviderOffer } from '@/modules/captain/types/provider'

const STATUS_BADGE: Record<ProviderOffer['status'], { variant: 'blue' | 'green' | 'red' | 'amber' | 'gray'; label: 'pendingResponse' | 'accepted' | 'rejected' | 'expired' }> = {
  pending:  { variant: 'amber', label: 'pendingResponse' },
  accepted: { variant: 'green', label: 'accepted' },
  rejected: { variant: 'red',   label: 'rejected' },
  expired:  { variant: 'gray',  label: 'expired' },
}

export default function Offers() {
  const t = useCaptainTranslations()
  const offers = useAppSelector(selectOffers)

  const columns = [
    { key: 'requestId', header: t('request_col'), render: (o: ProviderOffer) => <span className="font-semibold text-[var(--color-text-main)]">{o.requestId}</span> },
    { key: 'quoteEGP',  header: t('yourQuote'), render: (o: ProviderOffer) => `EGP ${o.quoteEGP}` },
    {
      key: 'status', header: t('status_col'),
      render: (o: ProviderOffer) => {
        const s = STATUS_BADGE[o.status]
        return <Badge variant={s.variant}>{t(s.label)}</Badge>
      },
    },
  ]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('offers_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('offers_sub')}</p>
      </div>
      <DataTable columns={columns} data={offers} keyField="id" />
    </div>
  )
}
