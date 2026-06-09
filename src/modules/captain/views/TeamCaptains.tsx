'use client'
import { UserPlus }       from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/i18n/translations'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { Captain }   from '@/shared/types'

const STATUS_MAP: Record<Captain['status'], { variant: 'green' | 'amber' | 'gray'; en: string; ar: string }> = {
  available: { variant: 'green', en: 'Available', ar: 'متاح'    },
  busy:      { variant: 'amber', en: 'Busy',      ar: 'مشغول'   },
  offline:   { variant: 'gray',  en: 'Offline',   ar: 'غير متصل'},
}

export default function TeamCaptains() {
  const language = useAppSelector(s => s.ui.language)
  const captains = useAppSelector(s => s.data.captains)

  const columns = [
    { key: 'name',   header: t('captain_col', language), render: (c: Captain) => <span className="font-semibold text-[var(--color-text-main)]">{c.name}</span> },
    { key: 'phone',  header: t('phone_col',   language) },
    { key: 'status', header: t('status_col',  language), render: (c: Captain) => {
        const s = STATUS_MAP[c.status]
        return <Badge variant={s.variant}>{language === 'ar' ? s.ar : s.en}</Badge>
      }
    },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('team_title', language)}</h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('team_sub', language)}</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors">
          <UserPlus size={14} />
          {t('addCaptain', language)}
        </button>
      </div>
      <DataTable columns={columns} data={captains} keyField="id" />
    </div>
  )
}
