'use client'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectDeliveries } from '@/features/captain/store/selectors'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { Delivery } from '@/features/tracking/types'

export default function Deliveries() {
  const t          = useCaptainTranslations()
  const deliveries = useAppSelector(selectDeliveries)

  const columns = [
    { key: 'id',      header: t('orderId'), render: (d: Delivery) => <span className="font-semibold text-[var(--color-text-main)]">{d.id}</span> },
    { key: 'captain', header: t('assignedCaptain') },
    { key: 'route',   header: t('route') },
    { key: 'status',  header: t('status_col'), render: (d: Delivery) => <Badge variant="blue" dot>{d.status}</Badge> },
  ]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('deliveries_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('deliveries_sub')}</p>
      </div>
      <DataTable columns={columns} data={deliveries} keyField="id" />
    </div>
  )
}
