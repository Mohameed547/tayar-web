'use client'
import { UserPlus }       from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import { selectCaptains } from '@/modules/captain/store/selectors'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { Captain } from '@/modules/captain/types/provider'

const STATUS_MAP: Record<Captain['status'], { variant: 'green' | 'amber' | 'gray'; label: 'available' | 'busy' | 'offline' }> = {
  available: { variant: 'green', label: 'available' },
  busy:      { variant: 'amber', label: 'busy' },
  offline:   { variant: 'gray',  label: 'offline' },
}

export default function TeamCaptains() {
  const t = useCaptainTranslations()
  const captains = useAppSelector(selectCaptains)

  const columns = [
    { key: 'name',   header: t('captain_col'), render: (c: Captain) => <span className="font-semibold text-[var(--color-text-main)]">{c.name}</span> },
    { key: 'phone',  header: t('phone_col') },
    { key: 'status', header: t('status_col'), render: (c: Captain) => {
        const s = STATUS_MAP[c.status]
        return <Badge variant={s.variant}>{t(s.label)}</Badge>
      }
    },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('team_title')}</h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('team_sub')}</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors">
          <UserPlus size={14} />
          {t('addCaptain')}
        </button>
      </div>
      <DataTable columns={columns} data={captains} keyField="id" />
    </div>
  )
}
