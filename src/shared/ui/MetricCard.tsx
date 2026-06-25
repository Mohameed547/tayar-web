'use client'
import clsx from 'clsx'
import { TrendingUp } from 'lucide-react'

// ── MetricCard ────────────────────────────────────────────────
interface MetricCardProps {
  value:     string
  label:     string
  change?:   string
  changeUp?: boolean
}
export default function MetricCard({ value, label, change, changeUp }: MetricCardProps) {
  return (
    <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-[14px] p-[18px]">
      <p className="text-[26px] font-extrabold text-[var(--dh-text-main)] leading-none">{value}</p>
      <p className="text-[12px] text-[var(--dh-text-sub)] mt-[6px]">{label}</p>
      {change && (
        <p className={clsx('text-[11px] mt-[6px] flex items-center gap-1', changeUp ? 'text-green-500' : 'text-red-500')}>
          {changeUp && <TrendingUp size={12} />}
          {change}
        </p>
      )}
    </div>
  )
}
