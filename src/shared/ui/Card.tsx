import clsx from 'clsx'

interface CardProps {
  children:  React.ReactNode
  className?: string
  hoverEffect?: boolean;
}
export default function Card({ children, className, hoverEffect = true }: CardProps) {
  return (
    <div className={clsx(
      'bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
      hoverEffect && 'transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:border-[var(--dh-brand)]/20 hover:-translate-y-0.5 transform',
      className,
    )}>
      {children}
    </div>
  )
}
