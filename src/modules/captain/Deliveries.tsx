'use client'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/translations'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { Delivery }  from '@/shared/types'

export default function Deliveries() {
  const language   = useAppSelector(s => s.ui.language)
  const deliveries = useAppSelector(s => s.data.deliveries)

  const columns = [
    { key: 'id',      header: t('orderId',         language), render: (d: Delivery) => <span className="font-semibold text-[var(--color-text-main)]">{d.id}</span> },
    { key: 'captain', header: t('assignedCaptain', language) },
    { key: 'route',   header: t('route',           language) },
    { key: 'status',  header: t('status_col',      language), render: (d: Delivery) => <Badge variant="blue" dot>{d.status}</Badge> },
  ]

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('deliveries_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('deliveries_sub', language)}</p>
      </div>
      <DataTable columns={columns} data={deliveries} keyField="id" />
    </div>
  )
}
